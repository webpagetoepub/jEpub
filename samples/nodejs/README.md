# Node.js ES Modules Example

This example demonstrates how to use jEpub in a Node.js environment with ES
modules.

## Features

- 📦 ES modules syntax (`import`/`export`)
- 📁 Advanced file system operations
- 🖼️ Robust image handling with error recovery
- 📚 Programmatic chapter generation
- 📊 Detailed progress tracking and statistics
- 🛡️ Comprehensive error handling
- 📝 Rich HTML content with styling
- 🔧 Production-ready patterns

## Prerequisites

- Node.js 18+ (ES modules support)
- Built jEpub library

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Ensure jEpub is built:
   ```bash
   cd ../..
   npm run build
   cd samples/nodejs
   ```

## How to Run

```bash
npm start
```

Or with Node.js watch mode for development:

```bash
npm run dev
```

## What It Does

This comprehensive example creates a detailed EPUB book featuring:

### Content Features

1. **Comprehensive Metadata**: Full book information with custom dates and UUIDs
2. **Cover Image**: Loads and processes cover image from demo folder
3. **Multiple Content Images**: Handles multiple images with graceful fallbacks
4. **Rich HTML Chapters**: Complex HTML with tables, code blocks, and styling
5. **Programmatic Content**: Automatically generates chapters from data
6. **Mixed Content Types**: Both HTML strings and text arrays
7. **Technical Documentation**: Detailed notes about the generation process

### Technical Features

1. **Error Handling**: Graceful handling of missing files and errors
2. **Progress Tracking**: Detailed progress reporting during generation
3. **Memory Management**: Efficient Buffer to ArrayBuffer conversion
4. **File System Safety**: Existence checks before file operations
5. **Performance Monitoring**: Timing and memory usage statistics
6. **Logging**: Comprehensive console output for debugging

## Code Structure

### Key Components

```javascript
// CommonJS imports
const jEpub = require('jepub').default;
const fs = require('fs');
const path = require('path');

// Safe image loading with error handling
function loadImageSafely(imagePath, imageName) {
  try {
    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      return { buffer: imageBuffer.buffer, success: true };
    }
    return { success: false };
  } catch (error) {
    console.log(`Error loading ${imageName}: ${error.message}`);
    return { success: false };
  }
}

// Programmatic chapter generation
const topics = [
  { title: 'Topic 1', content: 'Description...' },
  // ... more topics
];

topics.forEach((topic, index) => {
  const chapterContent = generateChapterContent(topic, index);
  jepub.add(`Chapter ${index + 1}: ${topic.title}`, chapterContent);
});
```

### Error Handling Patterns

- **File Operations**: Check existence before reading
- **Image Processing**: Graceful fallbacks for missing images
- **Memory Management**: Proper Buffer handling
- **Process Monitoring**: Memory and performance tracking

## Output

The script generates:

### Console Output

- 🔤 Utility function demonstrations
- 📊 Step-by-step progress with detailed logging
- 📈 Comprehensive statistics and performance metrics
- 💾 Memory usage information

### Generated Files

- **EPUB File**: `nodejs-commonjs-sample-[timestamp].epub`
- **Timestamped Names**: Prevents file conflicts
- **Detailed Metadata**: Embedded generation information

### Content Structure

- **Introduction**: Technical overview and specifications
- **CommonJS Chapter**: Module system and patterns
- **Image Chapter**: Image processing demonstration (if images available)
- **Topic Chapters**: Programmatically generated content
- **Conclusion**: Summary in array format
- **Technical Notes**: Comprehensive documentation

## Features Demonstrated

### jEpub Capabilities

- ✅ Complete book metadata configuration
- ✅ Custom publication dates and UUIDs
- ✅ Cover and multiple content images
- ✅ Rich HTML content with CSS styling
- ✅ Mixed content types (HTML + arrays)
- ✅ Comprehensive notes section
- ✅ Progress callbacks with detailed reporting
- ✅ Static utility methods

### Node.js Patterns

- ✅ CommonJS module system
- ✅ Synchronous file operations
- ✅ Buffer manipulation
- ✅ Path operations
- ✅ Process information access
- ✅ Error handling and recovery
- ✅ Performance monitoring

### Production Patterns

- ✅ Comprehensive error handling
- ✅ Graceful degradation
- ✅ Resource validation
- ✅ Progress reporting
- ✅ Memory monitoring
- ✅ Detailed logging
- ✅ File safety checks

## Advanced Features

### Image Processing

- Automatic image type detection
- Safe file loading with existence checks
- Graceful fallbacks for missing images
- Multiple image support with templating

### Content Generation

- Programmatic chapter creation from data
- Rich HTML with embedded CSS
- Code syntax highlighting
- Tables and structured content

### Performance Monitoring

- Generation time tracking
- Memory usage reporting
- Progress callback counting
- File size analysis

## Compatibility

- **Node.js**: 12+ (CommonJS support)
- **Module System**: CommonJS (`require`/`module.exports`)
- **File Operations**: Synchronous fs operations
- **Error Handling**: Try-catch with graceful fallbacks

## Production Considerations

For production use, this example demonstrates:

- ✅ Proper error handling and recovery
- ✅ Resource validation and safety checks
- ✅ Memory and performance monitoring
- ✅ Comprehensive logging for debugging
- ✅ Graceful degradation for missing resources
- ⚠️ Consider async file operations for better performance
- ⚠️ Add input validation for user-provided content
- ⚠️ Implement streaming for very large files
