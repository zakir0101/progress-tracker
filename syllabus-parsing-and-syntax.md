# Syllabus JSON Parsing and Syntax Documentation

## Overview

This document provides a comprehensive guide to the syllabus JSON file syntax and the sophisticated parsing mechanism used in the IGCSE Progress Tracker system. The system uses a dual-file approach (JSON + MD) with a recursive parsing algorithm to handle complex educational content structures.

## File Structure

### Dual-File Approach
Each syllabus uses two files:
- `{course_id}.json` - Contains detailed hierarchical structure with chapters, topics, and educational metadata
- `{course_id}.md` - Contains syllabus metadata, variant definitions, and descriptions

### JSON File Structure
All JSON files follow the same top-level structure:

```json
[
  {
    "variant_key": {
      "VariantName": ["path.to.content,fields"],
      "AnotherVariant": ["path.to.content,fields", "another.path"]
    },
    "chapters": [
      {
        "name": "Chapter Name",
        "number": 1,
        // Content fields based on variant_key specifications
      }
    ]
  }
]
```

## variant_key Syntax

### Basic Syntax
```json
"variant_key": {
  "VariantName": ["path.to.field1,field2"]
}
```

### Dot Notation Parsing
The parser splits each path string using dot notation:
- **Nested keys**: Everything before the last dot (navigation path)
- **Last keys**: Everything after the last dot (fields to extract)

**Example**: `"topics.description,examples"` becomes:
- Nested keys: `["topics"]`
- Last keys: `"description,examples"`

### Multiple Paths
Variants can specify multiple paths, which are processed in order:
```json
"Extended": [
  "extended_topics.description,examples",
  "topics.description,examples"
]
```

## Content Extraction Patterns

### Pattern 1: Simple Topic Structure (0580, 9709)
```json
"variant_key": {
  "Core": ["topics.description,examples"],
  "Extended": ["extended_topics.description,examples", "topics.description,examples"]
}
```

**Chapter Structure**:
```json
{
  "name": "Number",
  "number": 1,
  "topics": [
    {
      "name": "Types of number",
      "number": 1,
      "description": "Educational content...",
      "examples": "Example tasks..."
    }
  ]
}
```

### Pattern 2: Core/Extended Field Structure (0625)
```json
"variant_key": {
  "Core": ["topics.core", "topics.sub-topics.core"],
  "Extended": ["topics.extended", "topics.sub-topics.extended"]
}
```

**Chapter Structure**:
```json
{
  "name": "Motion, forces and energy",
  "number": 1,
  "topics": [
    {
      "name": "Physical quantities and measurement techniques",
      "number": 1,
      "core": "Core content...",
      "extended": "Extended content...",
      "sub-topics": [
        {
          "name": "Effects of forces",
          "core": "Core sub-topic content...",
          "extended": "Extended sub-topic content..."
        }
      ]
    }
  ]
}
```

### Pattern 3: Chapter-as-Topic Structure (0606)
```json
"variant_key": {
  "[main]": ["description"]
}
```

**Chapter Structure**:
```json
{
  "name": "Functions",
  "number": 1,
  "description": "Complete chapter content..."
}
```

## Recursive Parsing Algorithm

### Core Methods

#### 1. `load_topics_and_desc(chap_raw, key_list)`
- **Input**: Raw chapter data, list of variant key paths
- **Process**: Iterates through each path, extracts content recursively
- **Output**: Combined description and topic dictionary

#### 2. `__resolve_description_from_list_of_keys(nested_keys, last_key_names, chap, depth)`
**Recursive Algorithm**:
```python
if nested_keys exist:
    for each nested key:
        if nested key exists in chapter:
            for each sub-chapter:
                recursively call with remaining nested_keys
                if depth == 0:
                    create Topic object from sub-chapter
else:
    extract content from last_key_names
```

#### 3. `__resolve_description_from_chapter_last_key(last_keys, chap, depth)`
- **Input**: Comma-separated field names, chapter data, depth
- **Process**: Extracts content from each specified field
- **Formatting**: Adds field names as headers
- **Output**: Formatted combined content

### Parsing Examples

#### Example 1: Simple Topic Extraction
**Input**: `"topics.description,examples"`
**Process**:
1. Navigate to `topics` array
2. For each topic:
   - Extract `description` field
   - Extract `examples` field
   - Format: `**TopicName**:\n\n[description]\n\n**examples**:\n\n[examples]`

#### Example 2: Nested Structure (0625)
**Input**: `"topics.sub-topics.core"`
**Process**:
1. Navigate to `topics` array
2. For each topic:
   - Navigate to `sub-topics` array
   - For each sub-topic:
     - Extract `core` field
     - Create sub-topic object

## Special Cases and Edge Cases

### 1. Empty Content Fields
```json
"core": "",
"extended": "Extended content only"
```
**Handling**: Empty fields are filtered out during parsing

### 2. Missing Fields
**Behavior**: Missing fields are skipped gracefully without errors

### 3. Single Field Extraction
```json
"[main]": ["description"]
```
**Behavior**: Extracts only the specified field without additional formatting

### 4. Multiple Variant Inheritance
```json
"Extended": [
  "extended_topics.description,examples",
  "topics.description,examples"
]
```
**Behavior**: Content from both paths is combined, with extended content appearing first

### 5. Sub-topic Hierarchies
**Structure**: Topics can contain `sub-topics` arrays for additional nesting
**Parsing**: Recursive algorithm handles unlimited nesting depth

## Database Transformation

### Variant Treatment
Each variant becomes an independent syllabus in the database:
- **ID Format**: `{course_id}_{variant_name.lower()}`
- **Name Format**: `{course_name} - {variant_name}`

### Topic Generation
- **With topics**: Topics generated from chapter topics
- **Without topics**: Chapters treated as topics directly
- **Topic ID Format**: `{variant_id}_{chapter_number}_{topic_number}`

### Contact Syllabus
Special syllabus created for new students:
- **ID**: `contact`
- **Topics**: "Contact Administrator" and "Enroll in Course"

## Educational Metadata

### Supported Fields
- `description`: Main educational content
- `examples`: Practical examples and tasks
- `core`: Core syllabus content
- `extended`: Extended syllabus content
- Custom fields as specified in variant_key

### Content Formatting
- **Field headers**: Automatically added based on field names
- **Combination**: Multiple fields combined with proper spacing
- **Cleaning**: Whitespace and formatting normalization

## Common Patterns

### Mathematics (0580)
- **Variants**: Core, Extended
- **Structure**: Topics with description and examples
- **Inheritance**: Extended includes Core content

### Physics (0625)
- **Variants**: Core, Extended
- **Structure**: Topics with core/extended fields + sub-topics
- **Complexity**: Multi-level hierarchical structure

### Advanced Mathematics (9709)
- **Variants**: AS Level, A Level
- **Structure**: Topics with description and examples
- **Progression**: A Level includes AS Level content

### Additional Mathematics (0606)
- **Variants**: [main]
- **Structure**: Chapters as topics with single description field
- **Simplicity**: No sub-topic hierarchy

## Error Handling

### Graceful Degradation
- Missing fields: Skipped without errors
- Empty content: Filtered out
- Invalid paths: Ignored

### Validation
- Course existence check
- File existence validation
- JSON parsing error handling

## Performance Considerations

### Recursive Depth
- Algorithm handles unlimited nesting
- Performance optimized for typical educational content depth

### Memory Usage
- Content loaded on-demand
- Efficient string concatenation
- Minimal object creation overhead

## Extension Points

### Adding New Field Types
1. Update variant_key specifications
2. Add field handling in parsing methods
3. No changes needed to recursive algorithm

### Supporting New Structures
1. Define variant_key paths
2. Ensure JSON structure matches paths
3. Parsing algorithm handles automatically

This comprehensive parsing system enables flexible educational content modeling while maintaining consistent database structure and user experience across different syllabus types and complexity levels.