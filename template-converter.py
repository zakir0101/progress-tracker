
import collections
import enum
import json
import os
from collections import defaultdict
from os.path import sep

# import frappe
# from frappe.utils import get_bench_path




def do_somethinkg_with_courses(reset: bool):
    pass
    # NOTE:  below is refrence code on how you could use the classes and method of this file . to parse syllabus .json files and convert them into textual format like those in ./syllabus-new/0580-example.txt file .. each subject should then have its own file .. put the result in 
 


    # subjects_with_variants = ["9702", "0625", "0580"]
    # sub_dict: dict[str, Course] = load_subjects_files()
    # index = 0
    # for id, course in sub_dict.items():
    #     index += 1
    #     frappe.log(
    #         f"\n\n\n**********************************************************"
    #     )
    #     frappe.log(f"*************************** {index}")
    #     frappe.log(f"********* {course.name} ***********")
    #     frappe.log(f"Number of variants = {len(course.variants)}")
    #     for variant_name, variant in course.variants.items():
    #
    #         print(f"\ncreating variant :  {variant_name} ************")
    #
    #         course_doc = create_course(course, variant, reset)
    #         if not course_doc:
    #             continue 
    #
    #         for j, chapter in enumerate(variant.chapters):
    #
    #             print("\ncreating chapter .. ", chapter.name)
    #             chap_doc = create_chapter(course_doc, variant, chapter)
    #             counter = 1
    #             frappe.db.commit()
    #             if not course.has_topics:
    #                 print("creating [main] lesson from chapter .. ")
    #                 create_lesson(
    #                     course_doc, variant, chap_doc, chapter, counter
    #                 )
    #                 counter += 1
    #             else:
    #                 # print(f"chap-{chapter.number} == {chapter.name}")
    #                 for i, topic in enumerate(chapter.topics.values()):
    #                     print("creating lesson from topic .. ", topic.name)
    #                     create_lesson(
    #                         course_doc, variant, chap_doc, topic, counter
    #                     )
    #                     counter += 1








syllabus_path = os.path.join(
    ".","syllabus-old"
)

all_courses = [
    f.split(".")[0] for f in os.listdir(syllabus_path) if f.endswith(".json")
]

igcse_courses = ["0606", "0625", "0580"]

# ["9709", "9702", "9231", "0625", "0606", "0580"]


class Topic:
    def __init__(
        self,
        name: str,
        nr: str,
        description: str,
    ) -> None:
        self.name = name
        self.number = nr
        self.description = description
        pass


class Chapter:
    def __init__(
        self,
        name: str,
        nr: int,
    ) -> None:
        self.name = name
        self.number = nr
        self.description = None
        self.topics: dict[str, Topic] = {}
        pass

    def load_topics_and_desc(self, chap_raw, key_list):
        self.description = ""
        for identifier_str in key_list:
            ident_split = identifier_str.split(".")
            last_key_names = ident_split[-1]
            nested_keys = ident_split[:-1]
            key_desc = self.__resolve_description_from_list_of_keys(
                nested_keys, last_key_names, chap_raw
            )
            self.description += key_desc

        remove_key_list = []

        for top_key, topic in self.topics.items():
            topic.description = topic.description.strip()
            if not topic.description:
                remove_key_list.append(top_key)
        for top_key in remove_key_list:
            self.topics.pop(top_key)

        self.description = self.description.strip("\n").strip().strip("\n")

    def __resolve_description_from_list_of_keys(
        self, nested_keys: list[str], last_key_names: str, chap: dict, depth=0
    ):
        desc = ""
        if nested_keys:
            for i, nested in enumerate(nested_keys):
                if not chap.get(nested, []):
                    continue
                for sub_chap in chap[nested]:
                    sub_desc = self.__resolve_description_from_list_of_keys(
                        nested_keys[i + 1 :],
                        last_key_names,
                        sub_chap,
                        depth + 1,
                    )
                    desc += sub_desc
                    if depth == 0:
                        top_name = sub_chap.get("name")
                        if top_name not in self.topics:
                            self.topics[top_name] = Topic(
                                top_name,
                                sub_chap.get("number"),
                                sub_desc,  # .strip("\n").strip().strip("\n"),
                            )
                        else:
                            self.topics[top_name].description = (
                                self.topics[top_name].description
                                + "\n\n"
                                + sub_desc  # .rstrip("\n").rstrip().rstrip("\n")
                            )

        else:
            desc += self.__resolve_description_from_chapter_last_key(
                last_key_names, chap, depth
            )
            c_name, c_nr = chap.get("name"), chap.get("number")

        return desc

    def __resolve_description_from_chapter_last_key(
        self, last_keys: str, chap: dict, depth=0
    ):
        desc = ""
        for key in last_keys.split(","):
            if not chap.get(key, ""):
                continue
            name = key
            if key != "examples":
                name = (
                    chap.get("name") #+ f"({key})"
                    if (depth > 0 and "name" in chap)
                    else key
                )
            desc += f"\n\n**{name}**:\n\n" + chap.get(key, "")
        return desc


class Paper:
    def __init__(self, name: str, nr: int, chapters: list[Chapter]) -> None:
        self.chapters = chapters
        self.name = name
        self.number = nr
        pass


class CourseVariant:

    def __init__(
        self, name, description_lines, id: str, papers: list[int] | None = None
    ) -> None:
        self.name: str = name
        self.description = "\n".join(description_lines)
        self.id: str = id
        self.chapters: list[Chapter] = []
        # self.papers: list[nr] = (
        #     papers if papers else [int(r) for r in id.split(",")]
        # )

    def add_chapter(self, chap_raw: dict, key_list: list[str], idx: int):

        chap_name: str = chap_raw["name"]

        chap_nr: int = chap_raw.get("number") or idx + 1
        chap = Chapter(chap_name, chap_nr)
        chap.load_topics_and_desc(chap_raw, key_list)
        self.chapters.append(chap)


class Course:
    def __init__(self, id: str) -> None:
        if id not in all_courses:
            raise Exception(f"Unsupported subject {id}")
        self.name: str = ""
        self.id = id
        self.has_topics = False if id == "0606" else True
        self.variants: dict[str, CourseVariant] = {}

        # initialization ..

        sub_path = os.path.join(syllabus_path, id)
        self.load_course_md_file(sub_path + ".md")
        self.load_course_json_file(sub_path + ".json")

        pass

    def raiseException(self, msg):
        raise Exception(msg)

    def load_course_md_file(self, file_path):

        not os.path.exists(file_path) and self.raiseException(
            f"somehow syllabus files for subject {id}.md"
            + "could not be found !!"
        )
        f = open(file_path, "r", encoding="utf-8")
        lines = f.readlines()
        start_i = 0
        variant_lines = []
        variant_name, variant_id = None, None
        for i, line in enumerate(lines):

            if line.strip().startswith("##"):
                if not self.name:
                    raise Exception
                if variant_lines and variant_name:
                    self.variants[variant_name] = CourseVariant(
                        variant_name, variant_lines, variant_id
                    )

                split = line.replace("##", "").split("==")
                variant_name = split[0].strip()
                variant_id = split[1].strip()
                variant_lines = []

            elif line.strip().startswith("#"):
                self.name = line.replace("#", "").strip()
                start_i = i + 1
            else:
                variant_lines.append(line.rstrip())

        self.variants[variant_name] = CourseVariant(
            variant_name, variant_lines, variant_id
        )

    def load_course_json_file(self, file_path: str):

        not os.path.exists(file_path) and self.raiseException(
            f"somehow syllabus files for subject {id}.json"
            + "could not be found !!"
        )
        f = open(file_path, "r", encoding="utf-8")
        content = f.read()
        raw_json = json.loads(content)

        for item in raw_json:
            variant_map: dict[str, list[str]] = item["variant_key"]
            chapters: list[dict] = item["chapters"]
            for idx, chap_row in enumerate(chapters):
                for variant_name, variant_key_list in variant_map.items():
                    self.variants[variant_name].add_chapter(
                        chap_row, variant_key_list, idx
                    )

    # def load_course_json_file_old(self, file_path: str):
    #
    #     not os.path.exists(file_path) and self.raiseException(
    #         f"somehow syllabus files for subject {id}.json"
    #         + "could not be found !!"
    #     )
    #     f = open(file_path, "r", encoding="utf-8")
    #     content = f.read()
    #     raw_json = json.loads(content)
    #
    #     paper_to_chapters_dict: dict[int, list] = defaultdict(list)
    #     paper_to_pnames_dict: dict[int, str] = defaultdict(str)
    #
    #     for item in raw_json:
    #         paper_to_key: dict[str, list[str]] = item["paper_to_key"]
    #         paper_to_variant: dict[str, list[str]] = (
    #             item["paper_to_variant"] if self.has_varaints else {}
    #         )
    #
    #         all_papers_numbers: list[int] = item["papers"]
    #
    #         g_name = item.get("name", "")
    #         for p in all_papers_numbers:
    #             paper_to_pnames_dict[p] += g_name
    #         chapters: list[dict] = item["chapters"]
    #         for chap in chapters:
    #             chap_name: str = chap["name"]
    #             chap_nr: int = chap["number"]
    #             for nr_str, identifier_str_list in paper_to_key.items():
    #                 chap_paper_nrs = list(map(int, nr_str.split(",")))
    #                 description = self.__resolve_description_from_chapter_(
    #                     identifier_str_list, chap
    #                 )
    #                 chapter_obj = Chapter(chap_name, chap_nr, description)
    #
    #                 paper_to_chapters_dict[nr_str].append(chapter_obj)
    #
    #     if self.has_topics:
    #         for papers_uniqe_id, chps in sorted(
    #             paper_to_chapters_dict_uniqe.items(), key=lambda x: x[0]
    #         ):
    #             self.papers_uniqe[papers_uniqe_id] = Paper(
    #                 papers_uniqe_id, -1, chps
    #             )
    #     else:
    #         for p_nr, chps in sorted(
    #             paper_to_chapters_dict.items(), key=lambda x: x[0]
    #         ):
    #             self.papers[p_nr] = Paper(
    #                 paper_to_pnames_dict[p_nr], p_nr, chps
    #             )


def load_subjects_files():
    sub_dict: dict[str, Course] = {}
    for sub in all_courses:
        sub_dict[sub] = Course(sub)
    return sub_dict
