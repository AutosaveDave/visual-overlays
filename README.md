# Whisps
[![License: Unlicense](https://img.shields.io/badge/license-Unlicense-blue.svg)](http://unlicense.org/)


![Whisps Demo Screenshot](./assets/images/Whisps-html-screenshot4B.png?raw=true "Screenshot")

## Description

Whisps is a single Javascript file that allows web developers to easily add lighting effects to their projects by adding the whisps.js script to the body of an HTML document and adding some class names and dataset values to existing HTML elements.  

*Whisps is still in development, with many planned features not yet added.*  

## Table of Contents

- [Installation](#installation)
  - [Add Script](#add-script)
  - [Assign Whisps](#assign-whisps)
- [Usage](#usage)
  - [Whisps Docs](#whisps-docs)
    - [Name Statements](#name-statements)
    - [Z-Index Statements](#z-index-statements)
    - [Alpha Statements](#alpha-statements)
  - [Whisp Statements](#whisp-statements)
    - [Enumerators](#enumerators)
    - [Whisp Strings](#whisp-strings)
  - [Whisp Phrases](#whisp-phrases)
    - [Phrase Types](#phrase-types)
    - [Mods](#mods)
      - [Sub-Mods](#sub-mods)
      - [Config Mods](#config-mods)
    - [Light Scale](#light-scale)
    - [Light Colors](#light-colors)
      - [Colors](#colors)
      - [Color Sets](#color-sets)
    - [Behavior](#behavior)
      - [Action Phrases](#action-phrases)
        - [Action Types](#action-types)
        - [Action Targets](#action-targets)
      - [Condition Phrases](#condition-phrases)
        - [Condition Subjects](#condition-subjects)
        - [Condition Types](#condition-types)
    - [Spawn Location](#spawn-location)
  - [Assign Controllers](#assign-controllers)
    - [Effect Types](#effect-types)
    - [Trigger Types](#trigger-types)
- [License](#license)
- [Contributing](#contributing)
- [Tests](#tests)
- [Questions](#questions)

## Installation

### Add Script
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

## Usage

### Whisps Docs
Whisps uses strings called Whisps Docs to set up each overlay. Whisps Docs are comprised of several different types of statements:  

#### Name Statements
In a Whisps Doc, the name is designated by `:`, `/`, or `=`. For example, to assign the name "overlay1" to the Whisps Doc, include `:overlay1`, `/overlay1`, or `=overlay1` in the Whisps Doc string.  
*It is recommended to begin the WhispsDoc string with its name for consistency.*  
*Although not required for basic functionality, assigning a name to a Whisps Doc allows you to easily control its overlay with HTML elements *(more details in [Assign Controllers](#assign-controllers))*.*  

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
| **TYPE** | **TYPE CODE** | **DESCRIPTION** |
| :------- | :-----------: | :-------------- |
| [Mod](#mods) *(default)* | `M` | Add or change sets of property presets to the whisps. |
| [Light Scale](#light-scale) | `LS` | Sets the radius (or min and max radii) of the whisps. |
| [Light Color](#light-colors) | `LC` | Sets the color(s) of the whisps to a valid whisp **[color](#colors)** or **[color set](#color-sets)** |
| [Behavior](#behavior) | `B` | Adds a behavior to the whisps (behaviors determine how/when the whisps move). |
| [Spawn Location](#spawn-location) |`@` | Sets where the whisps spawn when the whisps overlay is turned on, restarted, or initialized. |

#### Mods
**Mods** are the most user-friendly Whisp phrases. Mod phrases are designated by a type code of `M`. Mods should generally come before any other types of whisp phrases There are 3 types of mods: **[Preset Mods](#preset-mods)**, **[Sub-Mods](#sub-mods)**, and **[Config Mods](#config-mods)**.
##### Preset Mods
**Preset Mods** set all necessary whisp properties and behaviors, simplifying your whisp statements. Whisp properties set by preset mods ***other than behaviors*** can be overwritten by subsequent whisp phrases. Properties of behaviors set by the preset mod can only be modified by **sub-mods** in the same whisp phrase as the preset mod. 
*Currently, not many preset mods are available, but more will be added in the future.*
| **MOD PHRASE** | **DESCRIPTION / SUB-MODS** |
| :----------- | :---------------------- |
| `whisp` | **Color**: `mystic` color set <br/>**Light Scale**: 2 to 5 (radius of 64px to 160px) <br/>**Behavior**: Move and Turn toward cursor at default speed |

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

#### Light Scale
The **light scale** can be set using type code `LS` followed by one or two integer arguments. If only one argument is provided, this will set the radius of whisps generated by the whisp statement to the integer argument multiplied by 32px. If two arguments are provided, this will be interpretted as the minimum and maximum light scale, and all whisps generated from the whisp statement will have a random light scale value between the minimum and maximum values *(the lower value is always treated as the minimum, and the higher value is always treated as the maximum, so the order of the arguments doesn't matter)*.

for example:

`LS-2` will set the light scale to 2, giving whisps a light radius of 64px ( 2 * 32 ).

`LS-2-6` will set the min light scale to 2 and the max light scale to 6, giving each whisp a random light radius between 64px ( 2 * 32 ) and 192px ( 6 * 32 ).

#### Light Colors
The whisp color can be set using type code `LC` followed by a color name. for example, `LC-red` will set the whisp color to red.

##### Colors

<span style="color:white; background-color:hsl(0,100%,50%);">**red**</span><br/>
<span style="color:black; background-color:hsl(30,100%,50%);">**orange**</span><br/>
<span style="color:black; background-color:hsl(60,100%,50%);">**yellow**</span><br/>
<span style="color:black; background-color:hsl(100,100%,50%);">**green**</span><br/>
<span style="color:black; background-color:hsl(150,100%,50%);">**sea**</span><br/>
<span style="color:black; background-color:hsl(180,100%,50%);">**cyan**</span><br/>
<span style="color:black; background-color:hsl(200,100%,50%);">**sky**</span><br/>
<span style="color:white; background-color:hsl(240,100%,50%);">**blue**</span><br/>
<span style="color:white; background-color:hsl(260,100%,50%);">**indigo**</span><br/>
<span style="color:white; background-color:hsl(280,100%,50%);">**purple**</span><br/>
<span style="color:black; background-color:hsl(300,100%,50%);">**pink**</span><br/>
<span style="color:black; background-color:hsl(335,100%,50%);">**fuschia**</span><br/>
<span style="color:black; background-color:hsl(0,100%,100%);">**white**</span><br/>

##### Color Sets

The whisp color can be set to a **color set**, which will randomly select a color from the designated color set. This is accomplished by using type code `LC` followed by the name of the desired color set. For example `LC-mystic` will set the whisp color to the "mystic" color set.

| **COLOR SETS** | **COLORS** |
| :------------- | :--------- |
| `all` | *All available colors* |
| `any` | *All available colors* |
| `notWhite` | *All availables colors, excluding white* |
| `primary` | red, blue, yellow |
| `usa` | red, white, blue |
| `rgb` | red, green, blue |
| `eldritch` | fuschia, purple, indigo, pink |
| `fire` | red, orange, yellow |
| `soulfire` | yellow, green, sea |
| `aquatic` | blue, sky, sea, cyan |
| `seaweed` | blue, sky, sea, cyan, green, indigo |
| `mystic` | white, cyan, sky, yellow |
| `mythic` | yellow, cyan, fuschia |

#### Behavior
Whisp behaviors can be set using **behavior phrases**, designated by a type code of `B`. A behavior phrase consists of at least one **action phrase** and zero or more **condition phrases**, separated by dashes (`-`). Whenever all conditions specified by condition phrases are met, the whisp will perform all actions specified by action phrases. If no condition phrases are included, the whisp always performs all actions specified by action phrases.

##### Action Phrases
An **action phrase** consists of an **action type** followed by arguments specific to that action type, separated by periods (`.`). *Currently, not many action types are available, but more will be added in the future.*

##### Action Types
| **ACTION TYPE** | **ARG 1** | **ARG 2** | **ARG 3** | **ARG 4** |
| :-------------- | :-------- | :-------- | :-------- | :-------- |
| `follow` | **target** - what the whisp is following | **speed** - maximum speed of the whisp in pixels/second | **acceleration** - acceleration of whisp in pixels/second<sup>2</sup>  | **turn speed** - angular turning speed of whisp in degrees/second |
| `flee` | **target** - what the whisp is fleeing from | **speed** - maximum speed of the whisp in pixels/second | **acceleration** - acceleration of whisp in pixels/second<sup>2</sup>  | **turn speed** - angular turning speed of whisp in degrees/second |

##### Action Targets
The `follow` and `flee` action types require a specified **target**. *Currently, not many valid targets are available, but more will be added in the future.*

| **ACTION TARGET** | **DESCRIPTION** |
| :---------------- | :-------------- |
| `cursor` | Sets the action target to the cursor's coordinates. |
| `nearest` | Sets the action target to the coordinates of the nearest whisp *(updated every frame)*. |

##### Condition Phrases
A **condition phrase** consists of a **condition signifier** (`if`, `on`, `when`, or `while`) followed by a **condition subject**, a **condition type**, and arguments specific to the condition type (in that order), separated by periods (`.`).

##### Condition Subjects
| **CONDITION SUBJECT** | **DESCRIPTION** |
| :-------------------- | :-------------- |
| `cursor` | Sets the condition subject to the cursor's coordinates. |
| `nearest` | Sets the condition subject to the coordinates of the nearest whisp *(updated every frame)*. |

##### Condition Types
| **CONDITION TYPE** | **ARGUMENTS** | **DESCRIPTION** |
| :----------------- | :--------- |:-------------- |
| `in`<br/>or<br/>`within` | If two arguments are provided, arguments are taken as the minimum value followed by the maximum value.<br/><br/>If only one argument is provided, it is taken as the maximum value, and the minimum value is set to zero. | Condition is met if the distance (in pixels) from the whisp to the condition subject is between the minimum and maximum values provided by arguments. |
| `out`<br/>or<br/>`outside` | If two arguments are provided, arguments are taken as the minimum value followed by the maximum value.<br/><br/>If only one argument is provided, it is taken as the maximum value, and the minimum value is set to zero. | Condition is met if the distance (in pixels) from the whisp to the condition subject **is NOT** between the minimum and maximum values provided by arguments. |

#### Spawn Location
A spawn location phrase can be used to designate where the whisps should spawn, designated by a type code of `@`. By default, whisps can spawn just out of frame anywhere along the top, right, bottom, and left sides of the whisp canvas.

A spawn location phrase consists of a **sides string** followed by one or two numerical arguments, all separated by dashes (`-`).

A **sides string** is a string of 1 to 4 characters that designates to which side(s) of the whisp canvas the subsequent arguments apply. 

The four valid characters that can be used in a sides string are: `t` (top), `r` (right), `b` (bottom), and/or `l` (left). The characters may appear in any order.

The **arguments** in a spawn location phrase are integers from 0 to 100 (inclusive). These values represent percentages of the length of each side designated in the sides string. 

If two arguments are provided, the first is the minimum side-length percentage, and the second is the maximum side-length percentage.

If only one argument is provided, the argument is taken as the maximum side-length percentage, and the minimum is set to zero.

The user can set different ranges for different sides by using multiple spawn location phrases. 

For example: 

`@-tb-25-75 @-lr-100` would set the whisps to spawn on the top and bottom sides of the canvas between 25% and 75% of the canvas width AND on the left and right sides of the canvas between 0% and 100% of the canvas height.

`@-trlb-30-70` would set the whisps to spawn on all sides between 30% and 70% of each side's length.

### Assign Controllers
If a whisps doc includes a [name statement](#name-statements), you can use the `class` attribute to assign HTML elements as **controllers** for the whisp canvas. To do this, add a class to the element in the following format:<br/>
`whisps-[whispsDocName]-[triggerType]-[effectType]`

#### Effect Types

| **EFFECT TYPE** | **DESCRIPTION** |
| :--------------- | :-------------- |
| `onoff` | Toggles the whisps overlay on/off when effect is triggered.<br/>*If used with the `set` trigger type, this effect currently only works with `<input>` elements with `type="checkbox"`.* |
| `reset` | Restarts the whisps overlay when effect is triggered. |
| `alpha` | Sets the opacity of the whisps overlay to the value of the controller element when effect is triggered.<br/>*This should only be used with `<input>` elements with `type="range"`.* |
| `doc` | Sets the text of the whisps doc to the value of the controller element when effect is triggered.<br/>***This effect type is intended ONLY for testing and demo purposes, and may cause serious issues.***<br/>*This should only be used with `<textarea>` elements or `<input>` elements with `type="text"`.* |

#### Trigger Types

| **TRIGGER TYPE** | **AVAILABLE EFFECT TYPES** | **DESCRIPTION** |
| :---------------- | :------------------------- | :-------------- |
| `click` | `onoff`<br/>`reset` | Triggers effect when the controller element is clicked, using the element's `onclick` event. |
| `set` | `onoff`<br/>`alpha`<br/>`doc` | Triggers effect when the value of the controller element is changed, using the element's `oninput` event. |
| `hover` | `onoff` | Turns the whisp overlay **on** when the mouse is over the controller element, using the element's `onmouseover` event.<br/>Turns the whisp overlay **off** when the mouse is over the controller element, using the element's `onmouseout` event.<br/>*Currently, whisps overlays using the `hover` trigger with the `onoff` effect are turned on when the page first loads. This will be fixed in the future.* |

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
