#!/usr/bin/env python3
import json

# Read the old JSON file
with open('/home/zakir/tmp/syllabuses/9231.json', 'r') as f:
    old_data = json.load(f)

# Extract all chapters from the old structure
all_chapters = {}
for variant in old_data:
    for chapter in variant['chapters']:
        chapter_name = chapter['name']
        all_chapters[chapter_name] = chapter

# Define the 3 new variants with their chapter combinations
new_variants = [
    {
        "variant_key": {
            "AS-level-paper-1,3": ["topics.description,examples"]
        },
        "chapters": [
            all_chapters["Further Pure Mathematics 1"],
            all_chapters["Further Mechanics"]
        ]
    },
    {
        "variant_key": {
            "AS-level-paper-1,4": ["topics.description,examples"]
        },
        "chapters": [
            all_chapters["Further Pure Mathematics 1"],
            all_chapters["Further Probability & Statistics"]
        ]
    },
    {
        "variant_key": {
            "A-level-paper-1,2,3,4": ["topics.description,examples"]
        },
        "chapters": [
            all_chapters["Further Pure Mathematics 1"],
            all_chapters["Further Pure Mathematics 2"],
            all_chapters["Further Mechanics"],
            all_chapters["Further Probability & Statistics"]
        ]
    }
]

# Write the new JSON file
with open('/home/zakir/tmp/syllabuses/9231.json', 'w') as f:
    json.dump(new_variants, f, indent=4, ensure_ascii=False)

print("Successfully created new 9231.json file with 3 variants")
print(f"Total variants: {len(new_variants)}")
for i, variant in enumerate(new_variants):
    variant_name = list(variant['variant_key'].keys())[0]
    chapter_count = len(variant['chapters'])
    print(f"  Variant {i+1}: {variant_name} ({chapter_count} chapters)")
    for chapter in variant['chapters']:
        print(f"    - {chapter['name']} ({len(chapter['topics'])} topics)")