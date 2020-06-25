# Path Editor

A free tool to modify paths online.

Accepts a variety of popular GPS formats, and can export to most of them too

## Features
1. [Input Formats](#input-formats)
	1. [Coordinates](#coordinates)
	2. [CSV](#csv)
	3. [GeoJSON](#geojson)
	4. [GPX](#gpx)
	5. [Polylines](#polylines)
2. [Editing paths](#editing-paths)
3. [Output Formats](#output-formats)
4. [Map Settings and Privacy](#map-settings-and-privacy)
5. [Roadmap](#roadmap)
6. [About](#about)



## Input Formats
There are several different file types that can include GPS coordinates. Currently this webapp only supports these ones. If there is a format you would like to support, please let me know and I will try to add it here.

### Coordinates
The simplest way to get this done.

Order must be latitude first followed by longitude

Accepts coordinates as an array or object (either option can be seperated by new lines)

**Array single line**
```javascript
[[37.76095,-122.42839],[37.76094,-122.42821],[37.76096,-122.42800],[37.76115,-122.42746],[37.76126,-122.42695],[37.76133,-122.42651] ]
```

**Array multi line**
```javascript
[37.76095,-122.42839],
[37.76094,-122.42821],
[37.76096,-122.42800],
[37.76115,-122.42746],
[37.76126,-122.42695],
[37.76133,-122.42651],
```

**Object single line**
```javascript
{lat: 37.76095, lng:-122.42839},{lat: 37.76094, lng:-122.42821},{lat: 37.76096, lng:-122.42800},{lat: 37.76115, lng:-122.42746},{lat: 37.76126, lng:-122.42695},{lat: 37.76133, lng:-122.42651},
```

**Object multi line**
```javascript
[
	{lat: 37.76095, lng:-122.42839},
	{lat: 37.76094, lng:-122.42821},
	{lat: 37.76096, lng:-122.42800},
	{lat: 37.76115, lng:-122.42746},
	{lat: 37.76126, lng:-122.42695},
	{lat: 37.76133, lng:-122.42651},
]
```

### CSV
Headers are optional. If they exist, they will be ignored.

Order must be latitude first followed by longitude

Example format
```
latitude, longitude
37.76084, -122.42851
37.76095, -122.42839
37.76094, -122.42821
37.76096, -122.42800
37.76115, -122.42746
37.76126, -122.42695
37.76133, -122.42651
```

### GeoJSON
Structured data types as JSON files can be parsed as long as they fit the [standard  GeoJSON](https://geojson.org/) format.

**This data structure expects longitude first then latitude.**

Only the first `Feature` of the first `FeatureCollection` will be considered. All other ones will be ignored.

Only `LineString` geometry will be parsed, all other types will be ignored. If you have multiple `LineString` objects, all of them will be parsed consecutively. Remove any extra ones if you want to skip them.

**GeoJSON example**
```json
{
	"type": "FeatureCollection",
	"features": [{
		"type": "Feature",
		"geometry": {
			"type": "LineString",
			"coordinates": [
				[-122.42851, 37.76084],
				[-122.42839, 37.76095],
				[-122.42821, 37.76094],
				[-122.42800, 37.76096],
				[-122.42746, 37.76115],
				[-122.42695, 37.76126],
				[-122.42651, 37.76133],
			]
		},
	}]
}
```

**Incomplete but correctly formatted JSON**
```json
{
	"type": "LineString",
	"coordinates": [
		[-122.42851, 37.76084],
		[-122.42839, 37.76095],
		[-122.42821, 37.76094],
		[-122.42800, 37.76096],
		[-122.42746, 37.76115],
		[-122.42695, 37.76126],
		[-122.42651, 37.76133],
	]
}
```

### GPX
Strava use this so of course I have to support it.
Unlike Strava, this tool doesnt require timestamps, so you can upload "incomplete" `.gpx` files and process them here.

**GPX File Sample**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<gpx creator="StravaGPX" ... >
	<metadata>...</metadata>
	<trk>
		<name>Evening Ride</name>
		<type>1</type>
		<trkseg>
			<trkpt lat="18.9740030" lon="72.8053450">
				<ele>105.0</ele>
				<time>2020-06-21T12:49:30Z</time>
			</trkpt>
			<trkpt lat="18.9740030" lon="72.8053450">
				<ele>105.0</ele>
				<time>2020-06-21T12:49:34Z</time>
			</trkpt>
			<trkpt lat="18.9740030" lon="72.8053450">
				<ele>105.0</ele>
				<time>2020-06-21T12:49:38Z</time>
			</trkpt>
		</trkseg>
	</trk>
</gpx>
```

### Polylines
Coordinates can be encoded into polylines using [Google's Polyline algorithm](https://developers.google.com/maps/documentation/utilities/polylinealgorithm). This is the smallest file size for coordinates, so if you are saving paths in bulk  this is the format for you.

Note:  Backslashes need to be escaped for polylines to render correctly.
If your polyline is not escaped you can use this snippet of code to do it:
```
p.split(String.fromCharCode(92)).join(String.fromCharCode(92,92));
```

**Polyline example**
```
gdneFdyfjVUW@c@Ci@e@kBUeBMwAYoKGgBMmBUgIOc@e@Gg@ByBLqBDmDP_Ll@sCHk@DgPp@oBJeARuB@uCLc@K_@]cFkH_BsBa@c@_CaDeC{CyKsOeBuB]g@S]uEeGiBkCy@eAIQWWcFcH{A{Bw@_AcDkEcBcC_DeEkCsDqD_F][e@Wa@[k@oAmAoBY_@a@[QQ_@Aa@@oBXi@Ca@BoAPy@TaC\\cAHq@XiCTa@DYJ_@F[KKSENq@Lo@DgBb@aAP{@FeC\\aBXu@Hu@NwBTwAVa@?c@Na@`@qB`DMJKCGFK\\Ud@W`@WV]@m@LQ?uAVk@F
 ```

## Editing paths
##### Editing
- Drag a vertex anywhere on the map to the correct it's position.

##### Adding
- Between two existing opaque vertices, drag the translucent vertex to a new position to create a new permanent vertex.

##### Deleting
The first or last vertex of the path cannot be deleted.

- Left click on a single vertex if you want to remove it.
- Draw a shape to remove vertices in bulk
	1. Right click to begin drawing a shape
	2. Right click a second time to confirm the size of the shape
	3. Adjust the bounds of the shape if you need to.
	4. Left click inside the translucent area of the shape to remove half of the vertices contained in the shape's bounds (repeat as many times as needed).
	5. Right click a third time to delete the shape
	6. Start the process over and repeat as many times as needed.

## Output Formats

1. Coordinates (array or object)
2. CSV
3. GeoJSON
4. Polylines

I am working on adding GPX that is compatible enough to upload to Strava.

## Map Settings and Privacy
The settings drawer contains some basic options to configure the UI of the map. These settings are saved in a cookie that expires in 14 days.

There is a bit of anonymous tracking on Google Analytics - simply for time spent at each step and file formats used during download/upload. If you have a strict content/ad blocker then this is skipped too.

**No GPS data is tracked in any way**. All processing is done on your own machine and uploaded nowhere. Poke around the code if you don't believe me. I wouldn't even know what to do with your GPS data if I had it.

## Roadmap
In no particular order
- Map themes
- Accept arrays, CSVs, and objects as input
- Add vertices from the start or end of the path
- Read from URLs as input
- Output previews
- Output stats (number of vertices edited, file size reduction etc.)
- Email URL for later when opened on mobile
- Keyboard gestures
- Share Map as Image
- Stats (distance, elevation etc) after edits complete
- Feedback button (formspree maybe?)




## About

I have a cheap little GPS unit that isn't perfect. I couldn't find a free tool to clean up my Strava bike rides so I made this tool to help me do that.

Check out the end result of all this hard work on [my website](https://rohan.xyz/maps).

Free to use.  Now and forever.

Most of the code is vanilla CSS and JS with the exception of the libraries below.

#### 3rd party code
[Polyline](https://github.com/mapbox/polyline) - Mapbox
[Simplecopy](https://github.com/kyle-rb/simplecopy) - Kyle Boyle
[Cookie.js](https://github.com/florian/cookie.js) - Florian Hartmann


#### Other cool mapping tools
[Strava Multiple Ride Mapper](https://www.jonathanokeeffe.com/strava/map.php) - Jonathan O'Keefe
[Heatflask](https://www.heatflask.com/) - Efrem Rensi
[Mapbox](https://www.mapbox.com/) - Didn't use them for this project but they do great work

