# Whisps
[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](http://unlicense.org/)


![Whisps Demo Screenshot](./assets/images/Whisps-html-screenshot4B.png?raw=true "Screenshot")

## Description

Whisps is a single Javascript file that allows web developers to easily add lighting effects to their projects by adding the whisps.js script to the body of an HTML document and adding some class names and dataset values to existing HTML elements.  

*Whisps is still in development, with many planned features not yet added.*  

## Table of Contents

  - [Installation](#installation)
  - [Usage](#usage)
  - [License](#license)
  - [Contributing](#contributing)
  - [Tests](#tests)
  - [Questions](#questions)

## Installation

### Add `<script>`
To add Whisps to an HTML document, include the following line at the end of the document body:  
`<script src="https://autosavedave.github.io/visual-overlays/whisps.js"></script>`  

Alternatively, you may copy whisps.js into your project directory and include the following line at the end of the document body:  
`<script src="./whisps.js"></script>`  
*This second method may be preferable, since changes to the Javascript file on GitHub may cause undesired behavior.*  

### Assign Whisps
To have a Whisps overlay appear on an element, add the class name `"whisps"` to the target element.  

Any elements with the class name `"whisps"` also need to have a Whisps doc- a string that designates the behavior of the overlay. The Whisps doc can be provided by assigning it to `data-whisps` on the target element. For example:  
`<div class="whisps" data-whisps=":overlay1 80% Z10 10x(whisp-fastest-smallest LC-mystic)"/>`  
*We'll break down the various components of Whisps doc strings in [Whisps Docs](#whisps-docs).*  

### Whisps Docs
Whisps uses strings called Whisps Docs to set up each overlay. Whisps Docs are comprised of several different types of statements:  

#### Name Statements
In a Whisps Doc, the name is designated by `:`, `/`, or `=`. For example, to name the Whisps Doc "overlay1", include `:overlay1`, `/overlay1`, or `=overlay1` in the Whisps Doc string.  
*It is recommended to begin the WhispsDoc string with its name for consistency.*  
*Although not required for basic functionality, assigning a name to a Whisps Doc allows you to easily control its overlay with `<input>` elements *(more details in [Assign Controllers](#assign-controllers))*.*  

#### Z-Index Statements
The Z-Index of the overlay (**NOT** the target element) can be assigned in a Whisps Doc using a Z-Index statement.  
Z-Index statements are designated by `Z` or `z` before or after the desired Z-Index value. For example:  
... To set overlay Z-Index to 10: `Z10` or `10Z` (or `z10` or `10z`)  
... To set overlay Z-Index to -1: `Z-1` or `-1Z` (or `z-1` or `-1z`)  
*If no Z-Index statement is found in the Whisps Doc, the overlay's Z-Index defaults to `1`.*  

#### Alpha Statements
The opacity (alpha) of the overlay's shadows can be assigned in a Whisps Doc using an Alpha statement.  
Alpha statements are designated by `A`, `a`, or `%` before or after the desired alpha value (`0` to `100`). For example:  
... To set overlay shadow Alpha to 90%: `A90`, `90A`, `%90`, `90%`, `a90`, or `90a` will all work.  

#### Whisp Statements
Each whisp statement consists of two main parts: an **enumerator** and a **Whisp string**.  
**Whisp strings** are designated by their enclosing parentheses.  
**Enumerators** can be placed adjacent to a Whisp string *(immediately before or immediately after enclosing parentheses of a Whisp string)* to designate how many whisps should be generated from that Whisp string.  
**Enumerators** can use a few different syntaxes. For example, if you wanted to generate 12 whisps from Whisp string `(whisp)`, all of the following will work:  
... `12(whisp)` or `(whisp)12`  
... `12x(whisp)`, `(whisp)x12`, `12X(whisp)`, or `(whisp)X12`  
... `12*(whisp)`, or `(whisp)*12`  
**Whisp strings** can contain several types of Whisp string statements. Statements within a Whisp string are separated by spaces.


#### 

### Assign Controllers



## Usage



## License

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>

## Contributing

N/A

## Tests

Try it out! Follow the directions provided in [Usage](#usage)

## Questions

Please contact me via email with any questions.

  - GitHub: [autosavedave](https://github.com/autosavedave)

  - Email: [autosavedave@gmail.com](mailto:autosavedave@gmail.com)
