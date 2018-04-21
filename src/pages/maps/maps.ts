import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Storage } from '@ionic/storage';
import { File } from '@ionic-native/file';



import {
  GoogleMap,
  GoogleMaps,
  Polygon,
  GoogleMapsEvent,
} from '@ionic-native/google-maps';
import { FileTransferObject, FileTransfer } from '@ionic-native/file-transfer';

@Component({
  selector: 'maps',
  templateUrl: 'maps.html',
  providers: []
})
export class Maps {
  gMap: GoogleMap;
  // Dummy boundary data as stored on the database
  boundaries = [
    {polygon: "30.976826548576355,-25.41587794893193 30.978114008903503,-25.4150106495908 30.978779196739197,-25.414385608767674 30.979363918304443,-25.4143952993478 30.97965359687805,-25.414569729656847 30.979771614074707,-25.414681171111077 30.979787707328796,-25.414797457736125 30.979744791984558,-25.414884672631334 30.97970724105835,-25.41504456644201 30.979637503623962,-25.41518023375148 30.979261994361877,-25.417263676832203 30.979385375976562,-25.417651290177638 30.979535579681396,-25.417917773629767 30.979589223861694,-25.418038902276937 30.979632139205933,-25.418189101630425 30.979599952697754,-25.41833445566531 30.979551672935486,-25.41846042902048 30.97942292690277,-25.41860578272825 30.979315638542175,-25.41868330463408 30.9789776802063,-25.418775361832505 30.977749228477478,-25.41878505205983 30.97744345664978,-25.41760283857761 30.977298617362976,-25.417249141307497 30.977132320404053,-25.41688575262064 30.976831912994385,-25.41613474586388 30.976783633232117,-25.4160087700788 30.976826548576355,-25.41587794893193", id: 1, tileBounds: "38407-38407-27980-27981,76814-76815-55961-55963,153628-153630-111923-111927,307257-307261-223847-223854,614514-614523-447694-447709,1229028-1229046-895389-895418", minZoom: 16, maxZoom: 19},
    {polygon: "30.979637503623962,-25.41716192812254 30.979546308517456,-25.417350889943577 30.979551672935486,-25.41743810299185 30.979583859443665,-25.41760283857761 30.979760885238647,-25.417922618777993 30.979857444763184,-25.4179565348101 30.9799861907959,-25.417971070249525 30.98015785217285,-25.417786954554135 30.980329513549805,-25.417728812697188 30.980511903762817,-25.417714277228562 30.98067283630371,-25.417738503008625 30.980753302574158,-25.417738503008625 30.980887413024902,-25.417670670812193 30.981080532073975,-25.417593148255268 30.981300473213196,-25.417564077283554 30.981547236442566,-25.41748655465808 30.98167061805725,-25.417496244989 30.981788635253906,-25.41744779332666 30.98197638988495,-25.417433257824158 30.982067584991455,-25.417418722319916 30.98217487335205,-25.417413877151432 30.982298254966736,-25.417481709492336 30.98243772983551,-25.417481709492336 30.982566475868225,-25.4174768643264 30.982823967933655,-25.417501090154158 30.98215878009796,-25.416284947589446 30.981997847557068,-25.416255876302316 30.981761813163757,-25.416309173656693 30.981606245040894,-25.41633339971906 30.98146677017212,-25.416406077876985 30.981268286705017,-25.416406077876985 30.98096787929535,-25.416221959791816 30.980603098869324,-25.416585350479256 30.980318784713745,-25.416551434061425 30.98021149635315,-25.416595040882587 30.979637503623962,-25.41716192812254", id: 2, tileBounds: "38407-38408-27981-27981,76815-76816-55962-55962,153630-153633-111924-111925,307261-307266-223848-223851,614522-614532-447697-447703,1229044-1229064-895394-895407", minZoom: 16, maxZoom: 19}
  ];
  // The selected current boundary
  currentBoundary = null;
  // Keep track of the google maps tile overlay object
  currentTileOverlayObject = null;
  // Keep track of the google maps polygon object
  currentPolygonObject = null;
  offlineTiles = {};

  baseUrl = 'https://s3.amazonaws.com/aero-test-data/';

  // The max zoom level for a user is zoom level 20
  maxZoomLevel = 19;
  private fileTransfer: FileTransferObject;

  constructor(public platform: Platform, private googleMaps: GoogleMaps, splashScreen: SplashScreen,
              private storage: Storage, private transfer: FileTransfer, private file: File) {
    // Load the map when the platform is ready
    platform.ready().then(() => {
      splashScreen.hide();
      setTimeout(this.loadMap.bind(this), 1000);
    });
  }

  loadMap(){
    // Create the google map element
    let element: HTMLElement = document.getElementById('map');
    this.gMap = GoogleMaps.create(element, {
      controls: {
        compass: false,
        myLocationButton: true,
        myLocation : true,
        indoorPicker: true,
        mapToolbar: true   // currently Android only
      }},);

    // Choose a random map center to start with
    let mapCenter = {lat: -25.417067447, lng: 30.98001837};
    let zoomLevel = 16;

    this.gMap.one(GoogleMapsEvent.MAP_READY).then(
      () => {
        console.log("Map ready: ", zoomLevel, mapCenter);
        this.gMap.setOptions({
          'mapType': 'MAP_TYPE_SATELLITE',
          'controls': {
            'compass': false,
            'myLocationButton': true,
            'indoorPicker': true,
            'mapToolbar': true   // currently Android only
          },
          'gestures': {
            'scroll': true,
            'tilt': false,
            'rotate': false,
            'zoom': true
          },
          'camera': {
            'target': mapCenter,
            'tilt': 0,
            'zoom': zoomLevel,
            'bearing': 0
          },
          'preferences': {
            'zoom': {
              'minZoom': 0,
              'maxZoom': 19
            },
            'padding': {
              'left': 30,
              'top': 50,
              'bottom': 20,
              'right': 10
            }
          }
        });

        // Add the polygons
        this.addPolygons();
      }
    );
  }

  // Function to add all the polygons which are linked to the client's account
  addPolygons(){
    // If there is client data present
    for (let i=0; i<this.boundaries.length; i++) {
      let boundary = this.boundaries[i];
      // Add the polygon to google maps
      this.gMap.addPolygon({
        points: this.convertPolygonStringToLatLngs(boundary.polygon),
        geodesic: true,
        fillColor: "rgba(255,255,255,0.6)",
        strokeColor: "#FFFFFF",
        strokeWidth: 2,
      }).then((polygon: Polygon) => {
        // Add the polygon click event
        this.addPolygonClickEvent(polygon, boundary.id);
      });
    }
  }

  addPolygonClickEvent(polygon: Polygon, databaseId){
    // Append the polygon to the all polygon objs list
    this.currentPolygonObject = polygon;
    // Make the polygon clickable
    polygon.setClickable(true);
    // Set the polygon with the database id
    polygon.set('databaseId', databaseId);
    // Add the click event for the polygon
    polygon.on(GoogleMapsEvent.POLYGON_CLICK).subscribe(
      () => {
        // Reset the previous polygon to white
        this.currentPolygonObject.setFillColor('rgba(255,255,255,0.6)');
        this.currentPolygonObject.setStrokeColor('#FFFFFF');
        // Make the polygon green
        polygon.setFillColor('rgba(93, 211, 158, 0.1)');
        polygon.setStrokeColor('rgb(93, 211, 158)');
        // Update the current polygon
        this.currentPolygonObject = polygon;
        this.overlayPolygonData(polygon.get('databaseId'));
      }
    )
  }

  overlayPolygonData(polygonId){
    // Update the boundary variable to have all the boundary information associated with the id
    this.currentBoundary = this.boundaries.filter((item) => {
      return item.id===polygonId;
    })[0];
    // Remove any previous tile overlay object which may exist
    this.removeTiles();
    // Make sure there are surveys available for this boundary
    this.overlayTiles();
  }

  removeTiles(){
    // If there already exists a tile overlay then remove it
    if (this.currentTileOverlayObject !== null && typeof this.currentTileOverlayObject !== 'undefined'){
      console.log("REMOVE TILE OVERLAY");
      this.currentTileOverlayObject.remove();
    }
  }

  overlayTiles(){
    // Store a temporary object of the constructor
    let tempObj = this;
    this.gMap.addTileOverlay({
      debug: true,
      // Load image files from the local file path
      getTile: function(x, y, zoom) {
        // scale coords
        console.log(x,y,zoom);
        let ymax = 1 << zoom;
        let yNew = ymax - y - 1;
        // Get the boundary id required
        let boundaryId = tempObj.currentBoundary.id;
        const offlineKey = boundaryId + '/visible/' + zoom + "/" + x + "/" + yNew + ".png";
        if (typeof tempObj.offlineTiles[boundaryId] !== 'undefined') {
          // Check first if the boundary key exists
          if (offlineKey in tempObj.offlineTiles[boundaryId]) {
            console.log('Tile path', tempObj.file.dataDirectory + (boundaryId + '/visible/' + zoom + "/" + x + "/" + yNew + ".png"));
            // return the path to the require tile
            return(tempObj.file.dataDirectory + (boundaryId + '/visible/' + zoom + "/" + x + "/" + yNew + ".png"));
          }
        }
        return null;
      }
    }).then(tileOverlay => {
        this.currentTileOverlayObject = tileOverlay;
      }
    )
  }

  // Function to convert polygon string returned from database to a google maps polygon array
  convertPolygonStringToLatLngs(polygonString){
    let coordinates = polygonString.split(" ");
    let polygonArray = [];
    for (let i in coordinates){
      let latLngs = coordinates[i].split(",");
      if (latLngs.length > 1){
        polygonArray.push({lat: latLngs[1], lng: latLngs[0]})
      }
    }
    return polygonArray;
  }

  getOrDownloadTiles() {
    // Initialise the file transfer object to download files
    this.storage.set('offline_tiles', null);
    this.storage.get('offline_tiles').then((offlineTiles) => {
      // If the offline tiles are not null then update the offline tiles variable
      if (offlineTiles !== null) {
        this.offlineTiles = offlineTiles;
      } else {
        this.downloadOfflineTiles();
      }
    })
  }

  downloadOfflineTiles() {
    for(let i = 0; i < 2 ; i++) {
      const boundary = this.boundaries[i];
      const tileBounds = boundary.tileBounds;
      const tileSplits = tileBounds.split(',');
      const minZoom = boundary.minZoom;
      // Get all the files to download
      const boundaryTileUrls = [];
      // Iterate through the min and max zoom to get the tiles which should be downloaded
      for (let i = minZoom; i <= this.maxZoomLevel; i++) {
        // Get the tiles at zoom level 20
        const relevantTiles = tileSplits[i - minZoom].split('-');
        const minX = parseInt(relevantTiles[0], 10);
        const maxX = parseInt(relevantTiles[1], 10);
        const minY = parseInt(relevantTiles[2], 10);
        const maxY = parseInt(relevantTiles[3], 10);
        // Iterate through the x and y to get all the tiles for the boundary
        for (let x = minX; x <= maxX; x++) {
          for (let y = minY; y <= maxY; y++) {
            const urlExtension = [boundary.id, 'visible', i, x, y + '.png'].join('/');
            boundaryTileUrls.push(urlExtension);
          }
        }
      }
      this.downloadTiles(boundaryTileUrls, boundary.id)
    }
  }

  /** Function which actually downloads the offline tiles **/
  downloadTiles(tileUrls, boundaryId) {
    this.platform.ready().then(() => {
      this.fileTransfer = this.transfer.create();
      this.offlineTiles[boundaryId] = {loadedTiles: 0, totalTiles: tileUrls.length, error: false};
      // Prepare the download tile promise
      const downloadTile = (urlExtension) => () => new Promise((resolve, reject) => {
        const url = urlExtension;
        const downloadUrl = this.baseUrl + urlExtension;
        // Make sure the file does not already exist
        this.file.checkFile(this.file.dataDirectory, url).then(() => {
          // Increment the loaded tiles variable
          this.offlineTiles[boundaryId].loadedTiles += 1;
          // Update the offline tiles local variable
          this.storage.set('offline_tiles', this.offlineTiles);
          // Resolve the promise
          resolve();
        }).catch(() => {
            const filepath = this.file.dataDirectory + url;
            this.fileTransfer.download(downloadUrl, filepath).then((entry) => {
              console.log('Tile download success', downloadUrl);
              // Add the url extension as a key with the fileUrl being the path in that key
              this.offlineTiles[boundaryId][urlExtension] = entry.toURL();
              // Update the storage that the offline tile has been downloaded
              // Increment the loaded tiles variable
              this.offlineTiles[boundaryId].loadedTiles += 1;
              // Update the offline tiles local variable
              this.storage.set('offline_tiles', this.offlineTiles);
              // Resolve the promise
              resolve();
            }, (onRejectedError) => {
              console.log('tile download error', onRejectedError);
              reject();
            }).catch((error) => {
              console.log('download error', error)
            });
          }
        );
      });
      this.sequence(tileUrls.map(downloadTile)).then(() => {
        console.log('COMPLETE', this.offlineTiles[boundaryId]);
      }).catch((error) => {
        console.log('DOWNLOAD ERROR OCCURRED', error);
        // Try again
        // this.downloadTiles(tileUrls, clientId, boundaryId);
        // Update that an error occurred allowing the user to try re-download
        this.offlineTiles[boundaryId].error = true;
      });
    })
  }

  sequence(promises) {
    return promises.reduce((previous, promise) => previous.then(promise), Promise.resolve());
  }
}
