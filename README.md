# MapMiner

MapMiner enables interactive visualization and exploration of temporal and spatial data. A map displays a heat map of locations for a time span selected on the timeline. Features like scrubbing, dragging and scroll wheel zoom for both map and timeline make diving into big datasets intuitive and fun.

MapMiner was developed as part of the [HeapCraft project](https://heapcraft.net/). The project site features an interactive demos of MapMiner with Minecraft player data: [demo1](https://heapcraft.net/mapminer/) (3.4MB), [demo2](https://heapcraft.net/mapminer/?dataURL=data/hc.json) (18.8MB).

The project was developed as part of a [master's thesis](http://heapcraft.net/?p=research) to explore data and create visualizations. Many features are undocumented and not exposed to the user. Most of them can be found in comments inside the source code.

![MapMiner Screenshot](https://heapcraft.net/mapminer/screenshot.png)

## Data Format

The input file is loaded from the path given by the url query parameter `dataURL`. The default value is `data/spacetime.json`. This repo includes an example file which is derived from gameplay recorded on a Minecraft server. It needs to be decompressed before it can be used.

The input data format is a JSON object:

```js
{
  "step": 180000,
  "enum": {...},
  "timeline": {...},
  "pos": {...}
}
```

To reduce data size, strings are substituted with integers. The mapping is stored in the `enum` object. It contains 4 different string groups: `player`, `world`, `event`, `material`. Assigning `enum['material']['LOG'] = 1` means the material `LOG` can be referenced using the id `1`.

Another method used to reduce data size is quantization. The temporal resolution is stored in `step` (180000ms, or 3min). The spatial resolution is *one pixel* (one block, in case of Minecraft; ignoring the z component). That way, thousands of *player move events* can be reduced to:

* During the 8 minute interval starting at `a`, player `b` moved a distance of `c` blocks (`timeline`)
* In world `w`, the 8 minute interval starting at `a`, player `b` spent `c` milliseconds on block `x,y` (`pos`)

Timeline data contains numbers associated with events. That number is usually number of event occurrences, or any value accumulated during the time interval. The data can be accessed using the key path schema `timeline[intervalStart][playerEnum][eventEnum]`.

Position data is represented as using a sparse matrix, where all non-zero values and their coordinates are included in a list: `[[x, y, v], ...]`. In the case of a position heat map, `v` represents time spent at that position. The data can be accessed using the key path schema `timeline[worldEnum][intervalStart][playerEnum]`.

## Feature Ideas

* Loading indicator.
* Center map around significant location.
* Grow dynamically with screen size.
* UI to restore 1:1 zoom (pixel perfect).
* UI to select world.
* UI to select players.
* UI to customize timeline information.
* UI to load custom data and configuration (see [GraphMiner](https://github.com/stepmuel/graphminer)).
* Put center coordinates and zoom level in url hash.
