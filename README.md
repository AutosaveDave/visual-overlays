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
In a Whisps Doc, the name is designated by `:`, `/`, or `=`. For example, to assign the name "overlay1" to the Whisps Doc, include `:overlay1`, `/overlay1`, or `=overlay1` in the Whisps Doc string.  
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

### Whisp Statements
Each whisp statement consists of two main parts: an **enumerator** and a **Whisp string**.  
**Whisp strings** are designated by their enclosing parentheses.  
**Enumerators** can be placed adjacent to a Whisp string *(immediately before or immediately after enclosing parentheses of a Whisp string)* to designate how many whisps should be generated from that Whisp string.  
#### Enumerators  
Enumerators can use a few different syntaxes. For example, if you wanted to generate 12 whisps from Whisp string `(whisp)`, all of the following will work:  
... `12(whisp)` or `(whisp)12`  
... `12x(whisp)`, `(whisp)x12`, `12X(whisp)`, or `(whisp)X12`  
... `12*(whisp)`, or `(whisp)*12`  
*If no enumerator is present on a Whisp string, only one whisp will be generated from the string by default.*  

#### Whisp Strings  
Whisp strings are always enclosed in parentheses, and can contain several types of Whisp phrases. Phrases within a Whisp string are separated by spaces.  

### Whisp Phrases
Several types of Whisp phrases can be used to customize your overlays. Whisp phrases consist of a **phrase type** and one or more **phrase segments** separated by dashes (`-`).  
`phraseType-phraseSegment1-phraseSegment2-phraseSegment3`  
#### Phrase Types
Whisp strings use several types of phrases. Each type is designated by its own **type code**. If no valid type code is recognized, the phrase type defaults to "Mods", and all phrase segments are treated as arguments.  
| **TYPE** | **TYPE CODE** | **ARG1** | **ARG2** | **ARG3** | **ARG4** | **DESCRIPTION** |
| :-------- | :-------------: | :-------- | :-------- | :-------- | :-------- | :--------------- |
| Mod *(default)* | M | | | | | Add or change sets of property presets to the whisp. See [Mods](#mods) section for details. |
| Light Scale | LS | Min scale | Max scale | | | Sets the min and max radius of the whisp to `32*scale` pixels. Each whisp generated by the whisp string will have a random light scale between the min and max scales. If only one argument is provided, min and max radius are both set by that argument. |
| Light Color | LC | Color (or color set) | | | | If arg1 is recognized as a [valid color](#colors), the whisp light color is set to that color. If arg1 is recognized as a [valid color set](#color-sets), each whisp generated from the whisp string will have its light color set to a color randomly chosen from that color set. |
| Behavior | B | | | | |  |
| Spawn Location | @ | Sides (`'t'`,`'b'`,`'l'`, and/or `'r'`) | Min position | Max position | |  |

#### Mods
**Mods** are the most user-friendly Whisp phrases. Mod phrases are designated by a type code of `M`. Mods should generally come before any other types of whisp phrases There are 3 types of mods: **Preset Mods**, **Sub-Mods**, and **Config Mods**.
##### Preset Mods
**Preset Mods** set all necessary whisp properties and behaviors, simplifying your whisp statements. Whisp properties set by preset mods ***other than behaviors*** can be overwritten by subsequent whisp phrases. Properties of behaviors set by the preset mod can only be modified by **sub-mods** in the same whisp phrase as the preset mod.
| **MOD PHRASE** | **DESCRIPTION / SUB-MODS** |
| :----------- | :---------------------- |
| whisp | Color: mystic color set <br/>Light Scale: 2 to 5 <br/>Behavior: Move and Turn toward cursor at default speed |
*Currently, not many preset mods are available, but more will be added in the future.*
##### Sub-Mods
**Sub-mods** modify behavior properties set by a preceding **preset mod**. *Currently, sub-mods can only modify movement speed and turn speed.

**MOVEMENT SPEED SUB-MODS** in order from slowest to fastest:

`slowest`<br/>
`slower`<br/>
`slow`<br/>
`slowish`<br/>
`fastish`<br/>
`fast`<br/>
`faster`<br/>
`veryfast`<br/>
`fastest`<br/>

##### Config Mods
**Config mods** modify specific whisp properties, allowing for more customization. **Currently, config mods can only modify whisp size, but more config mods will be added in the future.**

**WHISP SIZE CONFIG MODS** in order from smallest to largest: 

`smallest`<br/>
`verysmall`<br/>
`small`<br/>
`smaller`<br/>
`small`<br/>
`smallish`<br/>
`largeish`<br/>
`large`<br/>
`larger`<br/>
`verylarge`<br/>
`largest`<br/>

#### Colors

#### Color Sets

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
