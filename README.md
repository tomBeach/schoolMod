# schoolMod

#### Background
As described on their website, the [21st Century School Fund](http://www.21csf.org/csf-home/) "is dedicated to building the public will and capacity to modernize public school facilities so they support high quality education and community revitalization."  With big decisions pending on proposed new investments for DC public schools, 21CSF was anxious to develop a tool that could enable decision-makers and stake-holders to understand the complexities of previous and proposed spending on school facilities.  The idea envisioned filters that would allow comparison of spending by zone (Ward or "feeder" regions), level (elementary, middle, high school) and/or agency (district public schools or charter public schools).  The tool would also allow inspection of data on any specific school, and would have a search function for finding school data.

#### Data
At the request of 21CSF clients, Google Maps was chosen for the regional mapping display, and data was layered onto the map via functions for geographic and school data.  Geographic data was available thanks to the [District of Columbia Open Data](http://opendata.dc.gov/) website, and was converted to geojson for local file storage and access.  School data was compiled by 21CSF and packaged into local csv files.  

#### Design
######Display Object
The dislayObj properties and methods manage the basic structure and functionality of dynamically-generated filter menus, labels and states.  In early stages of the project, some uncertainty about which filters would be used and how they would interact suggested this dynamic approach, so that the javascript code could accomodate design changes.  As the filter choices solidified, most of the menu was "hard-coded" into html.

######Zone Data Object
The zonesCollectionObj creates the model structure for geographic zone data -- both geojson collections and aggregation data for tracking school expenditures.  Since the map was being used as a chloropleth to enable regional data comparison, some of this functionality involved accessing data from multiple files and merging it into an array before iterating through regional polygons and adding them to the map with customized styling.  


