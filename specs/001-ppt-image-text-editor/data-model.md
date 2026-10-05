# Data Model: PPT-Style Image & Text Editor

## Entities

### Project

Represents a saved document/project.

- `id`: string (UUID or timestamp-based)
- `title`: string
- `canvasWidth`: number
- `canvasHeight`: number
- `backgroundImage`: string | null (Base64 Data URL)
- `textBlocks`: TextBlock[]
- `createdAt`: string (ISO date)
- `updatedAt`: string (ISO date)

### TextBlock

Represents an individual text layer on the canvas.

- `id`: string (Unique identifier)
- `text`: string (Content)
- `x`: number (Position X)
- `y`: number (Position Y)
- `width`: number (Box width for text wrapping)
- `fontFamily`: string
- `fontSize`: number
- `color`: string (Hex code)
- `textAlign`: 'left' | 'center' | 'right'
- `bold`: boolean
- `italic`: boolean
- `strokeColor`: string | null
- `strokeWidth`: number
- `shadowColor`: string | null
- `shadowBlur`: number

### FontDefinition

- `name`: string (e.g., 'Montserrat', 'Playfair Display')
- `fontFamily`: string
- `category`: 'Sans-serif' | 'Serif' | 'Handwriting' | 'Display'
- `isVietnameseSupported`: boolean
