#!/usr/bin/env python3
import json

# Read the old JSON file
with open('/home/zakir/tmp/syllabuses/9709_old.json', 'r') as f:
    old_data = json.load(f)

# Extract all chapters from the old structure
all_chapters = {}
for variant in old_data:
    for chapter in variant['chapters']:
        chapter_name = chapter['name']
        all_chapters[chapter_name] = chapter

# Define the 5 new variants with their chapter combinations
new_variants = [
    {
        "variant_key": {
            "AS-level-paper-1,2": ["topics.description,examples"]
        },
        "chapters": [
            all_chapters["Pure Mathematics 1"],
            all_chapters["Pure Mathematics 2"]
        ]
    },
    {
        "variant_key": {
            "AS-level-paper-1,4": ["topics.description,examples"]
        },
        "chapters": [
            all_chapters["Pure Mathematics 1"],
            all_chapters["Mechanics (For Paper 4)"]
        ]
    },
    {
        "variant_key": {
            "AS-level-paper-1,5": ["topics.description,examples"]
        },
        "chapters": [
            all_chapters["Pure Mathematics 1"],
            all_chapters["Probability & Statistics 1"]
        ]
    },
    {
        "variant_key": {
            "A-level-paper-1,3,4,5": ["topics.description,examples"]
        },
        "chapters": [
            all_chapters["Pure Mathematics 1"],
            all_chapters["Pure Mathematics 3"],
            all_chapters["Mechanics (For Paper 4)"],
            all_chapters["Probability & Statistics 1"]
        ]
    },
    {
        "variant_key": {
            "A-level-paper-1,3,5,6": ["topics.description,examples"]
        },
        "chapters": [
            all_chapters["Pure Mathematics 1"],
            all_chapters["Pure Mathematics 3"],
            all_chapters["Probability & Statistics 1"],
            all_chapters["Probability & Statistics 2"]
        ]
    }
]

# Write the new JSON file
with open('/home/zakir/tmp/syllabuses/9709.json', 'w') as f:
    json.dump(new_variants, f, indent=4, ensure_ascii=False)

print("Successfully created new 9709.json file with 5 variants")
print(f"Total variants: {len(new_variants)}")
for i, variant in enumerate(new_variants):
    variant_name = list(variant['variant_key'].keys())[0]
    chapter_count = len(variant['chapters'])
    print(f"  Variant {i+1}: {variant_name} ({chapter_count} chapters)")