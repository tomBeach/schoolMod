# schoolMod

#### Background
As described on their website, the [21st Century School Fund](http://www.21csf.org/csf-home/) "is dedicated to building the public will and capacity to modernize public school facilities so they support high quality education and community revitalization."  With big decisions pending on proposed new investments for DC public schools, 21CSF was anxious to develop a tool that could enable decision-makers and stake-holders to understand the complexities of previous and proposed spending on school facilities.  The idea envisioned filters that would allow comparison of spending by zone (Ward or "feeder" regions), level (elementary, middle, high school) and/or agency (district public schools or charter public schools).  Spending data was to be grouped into "past", "planned" or "lifetime" categories, and then filtered on a "per student" or "per square foot" basis.  This would allow for more accurate comparison of values between differing student populations and building sizes.  The tool would also allow inspection of data on any specific school, and have a search function for finding information on a specifically selected school.

#### Data
At the request of 21CSF clients, Google Maps was chosen for the regional mapping display, and data was layered onto the map via functions specialized for geographic (polygon) and school (math) processing.  Geographic data was available thanks to the [District of Columbia Open Data](http://opendata.dc.gov/) website, and was converted to geojson for local file storage and access.  School data was compiled by 21CSF and packaged into local csv files.  

#### Design
The website uses client-side javascript, jquery, jquery widgets and d3 to handle user interaction, data processing and graphic display in addition to mapping.  

######Display Object
The dislayObj properties and methods manage the basic structure and functionality of dynamically-generated filter menus, labels and states.  In early stages of the project, some uncertainty about which filters would be used and how they would interact suggested this dynamic approach, so that the javascript code could accomodate design changes.  As the filter choices solidified, most of the menu was "hard-coded" into html, with display and event processing handled by css and javascript.  Also, selection of some filters required dynamic modification of the menu.  For example, selecting "Middle School Feeder Zones" requires deactivating High School and Middle School level options, since only elementary schools "feed" into middle schools.

######Zone Data Object
The zonesCollectionObj creates the model structure for geographic zone data -- both geojson collections and aggregated data for tracking expenditures by region.  Since the map was being used as a chloropleth to enable regional comparison, some of this functionality involved accessing data from multiple files and merging it into arrays before iterating through geographic polygons and adding them to the map with customized styling.  Individual data values were placed into "bins" derived from minimum and maximum values, and mapping regions were color-coded based on the aggregated values of each bin.  

######School Data Object
Data for an individual school is displayed in a simple "profile" chart, but some complexities had to be manouvered when displaying school markers on the map.  For example, when multiple schools occupied a single building (a characteristic of some charter schools), specialty "sub-functions" were required so that they could share the same marker.  Also, markers were color-coded to distinguish school-type, and were given a "hilite" function that responds to a successful outcome of the search process.  

######Utilities
Several text processing steps were required to "clean up" data and enable matching between different data sources in earlier versions of the project.  For example, school feeder zones were identified by "short" school names (which required matching to long-name versions in the csv files) or "GIS_ID", which required character stripping and conversion to integer data type.  For improved UX, school and filter selections were modified for readability and character/space limitations on the display.  

