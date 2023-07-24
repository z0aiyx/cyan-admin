
import "ol/ol.css";
import * as ol from "ol";
import { Map, View, Overlay } from "ol";
import XYZ from "ol/source/XYZ";
import { OSM, TileArcGISRest, ImageArcGISRest, TileImage, Vector as VectorSource, WMTS, ImageStatic } from "ol/source";
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import TileWMS from 'ol/source/TileWMS';
import ImageWMS from 'ol/source/ImageWMS';
import TileGrid from "ol/tilegrid/TileGrid"
import { tile as tileStrategy } from 'ol/loadingstrategy';
import { createXYZ } from 'ol/tilegrid';
import * as proj from "ol/proj";
import { Tile as TileLayer, Vector as VectorLayer, Image as ImageLayer, Heatmap } from 'ol/layer';
import { Circle as CircleStyle, Fill, Stroke, Style, Icon, Text } from 'ol/style';
import GeoJSON from 'ol/format/GeoJSON.js';
import EsriJSON from 'ol/format/EsriJSON';
import * as extent from 'ol/extent';
import { defaults as defaultControls, ScaleLine, OverviewMap } from 'ol/control';
import Draw from 'ol/interaction/Draw';
//import {unByKey} from 'ol/Observable';
import * as  sphere from 'ol/sphere';
import * as Observable from 'ol/Observable';
import Projection from 'ol/proj/Projection';
import Feature from 'ol/Feature';
import { fromCircle as makeCircle } from "ol/geom/Polygon";
import { bbox as bboxStrategy } from 'ol/loadingstrategy';
import { Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon, Circle } from 'ol/geom';
import { DEVICE_PIXEL_RATIO } from 'ol/has.js';
import WindyStn from "./widgets/WindyStn"
import WindyGrid from "./widgets/WindyGrid"
import ADLayer from "./widgets/echart.es5"
import * as turf from "@turf/turf"
import proj4 from 'proj4'
import jsonConverters from './widgets/jsonConverters'
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas'
import lidw from "./widgets/lidw"
import lidwraster from "./widgets/lidwraster_ol"
import lcolor from "./widgets/lcolor"
import ldraw from "./widgets/ldraw_ol"
import llineChunk from "./widgets/llinechunk"
import lgaussAir from "./widgets/lgaussair"
import projcn from './widgets/proj'

let lgis = function () {
  var map = null;
  let view = null;
  this.layerlist = [];
  this.eventlist = [];
  this.overlist = [];
  this.mapEvents = [];
  this.basemaps = {
    //天地图-矢量-底图
    tdt_vec_w: { id: "tdt_vec_w", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=vec_w&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202" },
    //天地图-矢量-注记
    tdt_cva_w: { id: "tdt_cva_w", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=cva_w&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202" },
    //天地图-影像-底图
    tdt_img_w: { id: "tdt_img_w", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202" },
    //天地图-影像-注记
    tdt_cia_w: { id: "tdt_cia_w", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=cia_w&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202" },
    //天地图-地形-底图
    tdt_ter_w: { id: "tdt_ter_w", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=ter_w&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202" },
    //天地图-地形-注记
    tdt_cta_w: { id: "tdt_cta_w", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=cta_w&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202" },

    //天地图-矢量-底图-wmts
    tdt_vec_w_wmts: { id: "tdt_vec_w_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/vec_w/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'vec', matrixSet: 'w' },
    //天地图-矢量-注记-wmts
    tdt_cva_w_wmts: { id: "tdt_cva_w_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/cva_w/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'cva', matrixSet: 'w' },
    //天地图-影像-底图-wmts
    tdt_img_w_wmts: { id: "tdt_img_w_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/img_w/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'img', matrixSet: 'w' },
    //天地图-影像-注记-wmts
    tdt_cia_w_wmts: { id: "tdt_cia_w_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/cia_w/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'cia', matrixSet: 'w' },
    //天地图-地形-底图-wmts
    tdt_ter_w_wmts: { id: "tdt_ter_w_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/ter_w/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'ter', matrixSet: 'w' },
    //天地图-地形-注记-wmts
    tdt_cta_w_wmts: { id: "tdt_cta_w_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/cta_w/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'cta', matrixSet: 'w' },

    //天地图-矢量-底图-经纬度
    tdt_vec_c: { id: "tdt_vec_c", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202", crs: 'EPSG:4326' },
    //天地图-矢量-注记-经纬度
    tdt_cva_c: { id: "tdt_cva_c", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=cva_c&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202", crs: 'EPSG:4326' },
    //天地图-影像-底图-经纬度
    tdt_img_c: { id: "tdt_img_c", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202", crs: 'EPSG:4326' },
    //天地图-影像-注记-经纬度
    tdt_cia_c: { id: "tdt_cia_c", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202", crs: 'EPSG:4326' },
    //天地图-地形-底图-经纬度
    tdt_ter_c: { id: "tdt_ter_c", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=ter_c&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202", crs: 'EPSG:4326' },
    //天地图-地形-注记-经纬度
    tdt_cta_c: { id: "tdt_cta_c", type: "tdt", url: "http://t{0-7}.tianditu.com/DataServer?T=cta_c&x={x}&y={y}&l={z}&tk=619944c64ea5110052ab50df192eb202", crs: 'EPSG:4326' },

    //天地图-矢量-底图-wmts-经纬度
    tdt_vec_c_wmts: { id: "tdt_vec_c_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/vec_c/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'vec', matrixSet: 'c', crs: 'EPSG:4326' },
    //天地图-矢量-注记-wmts-经纬度
    tdt_cva_c_wmts: { id: "tdt_cva_c_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/cva_c/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'cva', matrixSet: 'c', crs: 'EPSG:4326' },
    //天地图-影像-底图-wmts-经纬度
    tdt_img_c_wmts: { id: "tdt_img_c_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/img_c/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'img', matrixSet: 'c', crs: 'EPSG:4326' },
    //天地图-影像-注记-wmts-经纬度
    tdt_cia_c_wmts: { id: "tdt_cia_c_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/cia_c/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'cia', matrixSet: 'c', crs: 'EPSG:4326' },
    //天地图-地形-底图-wmts-经纬度
    tdt_ter_c_wmts: { id: "tdt_ter_c_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/ter_c/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'ter', matrixSet: 'c', crs: 'EPSG:4326' },
    //天地图-地形-注记-wmts-经纬度
    tdt_cta_c_wmts: { id: "tdt_cta_c_wmts", type: "wmts", url: "http://t{0-7}.tianditu.gov.cn/cta_c/wmts?tk=619944c64ea5110052ab50df192eb202", format: 'tiles', layer: 'cta', matrixSet: 'c', crs: 'EPSG:4326' },




    //OSM
    osm: { id: "osm", type: "osm" },

    //高德-矢量-底图
    gaode_vec: { id: "gaode_vec", type: "gaode", url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=7&x={x}&y={y}&z={z}' },
    //高德-矢量-底图
    gaode_img: { id: "gaode_img", type: "gaode", url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=6&x={x}&y={y}&z={z}' },
    //高德-矢量-底图
    gaode_road: { id: "gaode_road", type: "gaode", url: 'http://wprd0{1-4}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&style=8&x={x}&y={y}&z={z}' },

    //GeoQ-暖色-底图
    geoq_vec: { id: "geoq_vec", type: "geoq", url: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}' },
    //GeoQ-灰色-底图
    geoq_gray: { id: "geoq_gray", type: "geoq", url: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}' },
    //GeoQ-深蓝-底图
    geoq_blue: { id: "geoq_blue", type: "geoq", url: 'https://map.geoq.cn/arcgis/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}' },

    //百度-默认地图
    baidu: { id: "baidu", type: "baidu", url: "http://api0.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&ak=yI5xHIM4KRSSgOGgvfiKBiVaGwa34Epi" },
    //百度-午夜蓝黑
    baidu_midnight: { id: "baidu_midnight", type: "baidu", url: "http://api0.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20190528&scale=1&ak=E4805d16520de693a3fe707cdc962045&customid=midnight" },
    //百度-黑色
    baidu_dark: { id: "baidu_dark", type: "baidu", url: "http://api0.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20190528&scale=1&ak=E4805d16520de693a3fe707cdc962045&customid=dark" },
    //百度-绿色
    baidu_grassgreen: { id: "baidu_grassgreen", type: "baidu", url: "http://api0.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20190528&scale=1&ak=E4805d16520de693a3fe707cdc962045&customid=grassgreen" },
    //百度-灰色
    baidu_grayscale: { id: "baidu_grayscale", type: "baidu", url: "http://api0.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&udt=20190528&scale=1&ak=E4805d16520de693a3fe707cdc962045&customid=grayscale" },

    //谷歌-矢量-底图
    google_vec: { id: "google_vec", type: "google_vec", url: 'http://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}' },
    //谷歌-影像-底图
    google_img: { id: "google_img", type: "google_img", url: "http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}" },

    //mapbox-矢量-底图
    mapbox_hypso: { id: "mapbox_hypso", type: "mapbox_hypso", url: 'https://b.tiles.mapbox.com/v3/mapbox.natural-earth-hypso-bathy/{z}/{x}/{y}' },
    //mapbox-影像-底图
    mapbox_ter: { id: "mapbox_ter", type: "mapbox_ter", url: "https://b.tiles.mapbox.com/v3/mapbox.natural-earth-1/{z}/{x}/{y}.png" },
    //mapbox-矢量-底图
    mapbox_dark: { id: "mapbox_dark", type: "mapbox_dark", url: 'https://b.tiles.mapbox.com/v3/mapbox.world-dark/{z}/{x}/{y}.png' },
    //mapbox-影像-底图
    mapbox_black: { id: "mapbox_black", type: "mapbox_black", url: "https://b.tiles.mapbox.com/v3/mapbox.world-black/{z}/{x}/{y}.png" },

    //超图-矢量
    supermap_vec: { id: "supermap_vec", type: "supermap", url: 'http://t1.supermapcloud.com/FileService/image?x={x}&y={y}&z={z}' },
    //超图-深色
    supermap_dark: { id: "supermap_dark", type: "supermap", url: "http://t3.supermapcloud.com/MapService/getGdp?map=quanguo&type=web&x={x}&y={y}&z={z}" },

  }
  this.imgLayer = null;
  this.tmpLayers = [];
  this.popup, this.popupDom;
  this.basemapConfig;
  this.baselayers = [];
  this.drawLayer;
  this.drawInteraction = null;
  this.isMeasure = false;
  this.addMeasureInteraction = addMeasureInteraction;
  this.addMeasureSource = addMeasureSource;
  this.clearMeasure = clearMeasure;
  this.MeasureDraw = null;
  this.MeasureSource = null;
  this.MeasureVector = null;
  this.Measurelistener = null;//绑定交互绘制工具开始绘制的事件
  this.MeasureSketch = null;

  this.initMap = initMap;
  this.setMapCenter = setMapCenter
  this.setLayerVisible = setLayerVisible;
  this.addPoints = addPoints;
  this.addLines = addLines;
  this.addPolygons = addPolygons;
  this.addWindy = addWindy;
  this.addImage = addImage;
  this.addHeatmap = addHeatmap;
  this.addOverlays = addOverlays;
  this.addServerLayer = addServerLayer;
  this.addPointlink = addPointlink;
  this.addMapEvent = addMapEvent;
  this.removeMapEvent = removeMapEvent;
  this.addScale = addScale;
  this.addOverview = addOverview;
  this.fromLonLat = fromLonLat;
  this.toLonLat = toLonLat;
  this.flyTo = flyTo;
  this.fitLayerExtent=fitLayerExtent;
  this.draw0 = draw0;
  this.draw = draw;
  this.drawStop = drawStop;
  this.drawClear = drawClear;
  this.buffer = buffer;
  this.interpolate = interpolate;
  this.lineChunk = lineChunk;
  this.lineColorful = lineColorful;
  this.setSize = setSize;
  this.showInfo = showInfo;
  this.hideInfo = hideInfo;
  this.layerClear = layerClear;
  this.layerOrder = layerOrder;
  this.drawAnalysisPoint = drawAnalysisPoint;
  this.ExplosiveAnalysis = ExplosiveAnalysis;
  this.EsriJsonToGeoJson = EsriJsonToGeoJson;
  this.GeoJsonToEsriJson = GeoJsonToEsriJson;
  this.isInsidePolygon = isInsidePolygon;
  this.createCircle = createCircle;
  this.CreateEllipse = CreateEllipse;
  this.CreateSector = CreateSector;
  this.CreateArrow = CreateArrow;
  this.createBuffer = createBuffer;
  this.mapShot = mapShot;
  this.getLength = getLength;
  this.getExtent = getExtent;
  this.updateFeatureText = updateFeatureText
  this.updateFeatureSymbol = updateFeatureSymbol;
  this.gradientColor = lcolor.gradientColor;
  this.getPOI = getPOI;
  this.getGeoCode = getGeoCode;
  this.getLayerById = getLayerById;
  this.showDirectionLabel = showDirectionLabel;
  this.gaussAir = gaussAir;
  this.union = union;
  this.getLayerBorder = getLayerBorder;
  this.distance = distance;
  this.projcn = projcn;
  this.getProjection = getProjection;

  this.addLabelToLayer = addLabelToLayer;
  this.clearLabelLayer = clearLabelLayer;
  this.addMarkingToLayer = addMarkingToLayer;
  this.clearMarkingLayer = clearMarkingLayer;
  this.PathAnimation = PathAnimation;


  var _this = this;
  var image = new CircleStyle({
    radius: 5,
    fill: new Fill({ color: 'red' }),
    stroke: new Stroke({ color: 'orange', width: 1 })
  });
  var styles = {
    'Point': new Style({
      image: image
    }),
    'LineString': new Style({
      stroke: new Stroke({
        color: 'red',
        width: 1
      })
    }),
    'MultiLineString': new Style({
      stroke: new Stroke({
        color: 'red',
        width: 10
      })
    }),
    'MultiPoint': new Style({
      image: image
    }),
    'MultiPolygon': new Style({
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        width: 2
      }),
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.3)'
      })
    }),
    'Polygon': new Style({
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 0.7)',
        lineDash: [1],
        width: 2
      }),
      fill: new Fill({
        color: 'rgba(255, 0, 0, 0.3)'
      })
    }),
    'GeometryCollection': new Style({
      stroke: new Stroke({
        color: 'magenta',
        width: 2
      }),
      fill: new Fill({
        color: 'magenta'
      }),
      image: new CircleStyle({
        radius: 10,
        fill: null,
        stroke: new Stroke({
          color: 'magenta'
        })
      })
    }),
    'Circle': new Style({
      stroke: new Stroke({
        color: 'red',
        width: 2
      }),
      fill: new Fill({
        color: 'rgba(255,0,0,0.2)'
      })
    })
  };
  this._MapConfig = {
    container: "map"
  }
  var Resolutions = [
    156543.03392800014,
    78271.51696399994,
    39135.75848200009,
    19567.87924099992,
    9783.93962049996,
    4891.96981024998,
    2445.98490512499,
    1222.992452562495,
    611.4962262813797,
    305.74811314055756,
    152.87405657041106,
    76.43702828507324,
    38.21851414253662,
    19.10925707126831,
    9.554628535634155,
    4.77731426794937,
    2.388657133974685,
    1.1943285668550503,
    0.5971642835598172,
    0.29858214164761665
  ]

  //初始化地图容器
  function initMap(options) {
    this._MapConfig = Object.assign(this._MapConfig, options);
    this.basemapConfig = options.basemaps;
    if (this.basemapConfig) {
      this.basemapConfig.forEach(basemap => {
        let layer = getLayerByType(basemap.type, basemap);
        _this.baselayers.push(layer);
      })
      _this.layerlist = _this.baselayers;
      options.baselayers = _this.baselayers;
      createMap(options);
    } else {
      //未设置底图，留空
    }
  }



  function setMapCenter(x, y) {
    var center = [x, y];
    view.setCenter(center);
  }
  //创建地图
  function createMap(options) {
    let container = options.container;
    let baselayers = options.baselayers;
    let center = options.center;
    let zoom = options.zoom;
    let minZoom = options.minZoom;
    let maxZoom = options.maxZoom;
    // 设置地图坐标系
    var projection = baselayers.length > 0 ? baselayers[0].getSource().getProjection() : null;
    if (!center) center = [0, 0]
    var projectionCode;
    if (projection) projectionCode = projection.getCode()
    else if (options.basemaps.length > 0 && options.basemaps[0].crs) projectionCode = options.basemaps[0].crs;
    else projectionCode = 'EPSG:3857'
    // 中心点坐标计算
    if (projectionCode == 'EPSG:3857') center = proj.fromLonLat(center)

    let p = proj4.defs(projectionCode, coordtrsf[projectionCode.replace('EPSG:', '')])
    view = new View({
      center: center,
      zoom: zoom ? zoom : 1,
      minZoom: minZoom ? minZoom : 0,
      maxZoom: maxZoom ? maxZoom : 28,
      projection: projection ? projection : proj.get(projectionCode)
    })
    map = new Map({
      target: container ? container : "map",
      layers: baselayers,
      view: view,
    });

    _this.map = map;

    //兼容mapv
    //window.ol = ol;
    window.map = map;

    //气泡初始化
    var popupDiv = document.createElement("div");
    popupDiv.id = "ol-popup";
    popupDiv.className = "ol-popup";
    popupDiv.innerHTML = '<a href="#" id="ol-popup-closer" class="ol-popup-closer"></a><div id="ol-popup-title" class="index-body">11</div><div id="ol-popup-content">11</div>';
    document.body.appendChild(popupDiv);
    _this.popupDom = {
      container: document.getElementById('ol-popup'),
      title: document.getElementById('ol-popup-title'),
      content: document.getElementById('ol-popup-content'),
      closer: document.getElementById('ol-popup-closer')
    }
    _this.popup = new Overlay({
      element: _this.popupDom.container,
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    _this.popupDom.closer.onclick = function () {
      _this.popup.setPosition(undefined);
      _this.popupDom.closer.blur();
      return false;
    };

    //地图单机事件
    map.on('singleclick', function (e) {

      var pixel = map.getEventPixel(e.originalEvent);
      var featureInfo = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
        return { feature: feature, layer: layer };
      });
      if (featureInfo !== undefined && featureInfo !== null && featureInfo.layer !== null) {
        // console.log(featureInfo.feature);
        // console.log(featureInfo.layer);
        //查找监听点击事件的图层
        for (let i = 0; i < _this.eventlist.length; i++) {
          const eventLayer = _this.eventlist[i];
          if (eventLayer == featureInfo.layer) {
            var popupinfo = eventLayer.popupFunction({
              event: e.originalEvent,
              attributes: featureInfo.feature.getProperties(),
              properties: featureInfo.feature.getProperties(),
              layerId: featureInfo.layer.get('id')
            });
            if (popupinfo) {
              showInfo(featureInfo.feature, popupinfo.title, popupinfo.content);
            }
          }
        }
        let feature = featureInfo.feature;
        var type = feature.getGeometry().getType();
        var property = feature.getProperties();
        return;
      }



    })


    //tooltip要素
    let tipDiv = document.createElement('div');
    tipDiv.className = 'mapTooltip';
    tipDiv.style.position = 'absolute';
    _this.tooltip = tipDiv;
    document.body.appendChild(tipDiv);

    let tooltip_waitClose = false;





    //地图绑定鼠标移出事件，鼠标移出时为帮助提示框设置隐藏样式
    map.getViewport().addEventListener('mouseout', function () {
      if (helpTooltipElement != null) {
        helpTooltipElement.className = "ol-tooltip hidden";
      }


    });
    //地图滑过事件
    map.on('pointermove', function (e) {
      if (this.isMeasure) {
        pointerMoveHandler(e);
        return;
      }
      var pixel = map.getEventPixel(e.originalEvent);
      var featureInfo = map.forEachFeatureAtPixel(pixel, function (feature, layer) {
        return { feature: feature, layer: layer };
      });
      if (featureInfo !== undefined && featureInfo !== null && featureInfo.layer !== null) {
        // console.log(featureInfo.feature);
        // console.log(featureInfo.layer);
        //查找监听点击事件的图层
        for (let i = 0; i < _this.overlist.length; i++) {
          const eventLayer = _this.overlist[i];
          if (eventLayer == featureInfo.layer) {
            var tooltipinfo = eventLayer.tooltipFunction(featureInfo.feature.getProperties());
            if (tooltipinfo) {
              showTooltip(featureInfo.feature, tooltipinfo);
              tooltip_waitClose = true;
              return;
            }
          }
        }
        if (tooltip_waitClose) {
          hideTooltip();
          tooltip_waitClose = false;
        }
        let feature = featureInfo.feature;
        var type = feature.getGeometry().getType();
        var property = feature.getProperties();
        return;
      }
      if (tooltip_waitClose) {
        hideTooltip();
        tooltip_waitClose = false;
      }

    })

    map.on('postcompose', function (e) {
      if (options.callback) {
        options.callback(e);
      }
    })



  }


  var AnalysisLyr = null;
  var AnalysisResultLyr = null;
  var AnalysisPointCoord = null;
  var AnalysisDrawTool = null;

  //设置分析绘点图层
  function AnalysisPointLayer() {
    AnalysisLyr = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new CircleStyle({
          radius: 2,
          fill: new Fill({
            color: "rgba(0,0,0,0)"
          })
        })
      }),
      zIndex: 90
    });
    map.addLayer(AnalysisLyr);
  }

  //销毁分析图层与绘图工具
  function destroyAnalysisLayer() {
    if (AnalysisLyr) {
      map.removeLayer(AnalysisLyr);
      AnalysisLyr = null;
    }
    if (AnalysisResultLyr) {
      map.removeLayer(AnalysisResultLyr);
      AnalysisResultLyr = null;
    }
    if (AnalysisDrawTool) {
      map.removeInteraction(AnalysisDrawTool);
      AnalysisDrawTool = null;
    }
  };

  //绘制分析点
  function drawAnalysisPoint(drawCallback) {
    destroyAnalysisLayer();
    AnalysisPointLayer();
    // 清空图层
    AnalysisLyr.getSource().clear();
    this.AnalysisLyr = AnalysisLyr
    if (AnalysisResultLyr != null) {
      AnalysisResultLyr.getSource().clear();
    }
    if (AnalysisDrawTool) return;

    var vPointStyle = new Style({
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: 'red' }),
        stroke: new Stroke({ color: 'red', width: 1 })
      })
    });
    // new Style({
    //     image: new Icon({
    //         src: require("@/assets/point.png"),
    //         anchor: [0.5, 1]
    //     })
    // })
    AnalysisDrawTool = new Draw({
      source: AnalysisLyr.getSource(),
      type: 'Point',
      style: vPointStyle
    });
    map.addInteraction(AnalysisDrawTool);
    AnalysisDrawTool.on('drawend', function (e) {
      // body...
      map.removeInteraction(AnalysisDrawTool);
      AnalysisDrawTool = null;
      var PointCoord = e.feature.getGeometry().getCoordinates();
      drawCallback(PointCoord);
      e.feature.setStyle(vPointStyle);

    });
  }



  // V 气体体积 m3
  // Hc 可燃气体高燃烧热值 kJ/m3
  // Cs = [0.06, 0.15, 0.4];//经验常数，取决于伤害等级
  //爆炸影响范围分析
  function ExplosiveAnalysis(PointCoord, V, Hc, N) {
    var ExplosivefeatureArr = [];
    this.ExplosivefeatureArr = null;
    this.ExplosivefeatureArr = [];
    if (AnalysisResultLyr) {
      map.removeLayer(AnalysisResultLyr);
      AnalysisResultLyr = null;
    }
    AnalysisResultLyr = new VectorLayer({
      source: new VectorSource(),
      zIndex: 80
    });
    AnalysisResultLyr.set("id", "AnalysisResultLyr");
    map.addLayer(AnalysisResultLyr);

    if (!PointCoord) {
      alert('请绘制爆炸发生位置！');
      return ExplosivefeatureArr;
    }
    if (!V || V <= 0) {
      alert('输入爆炸气体体积并且不能为负值！');
      return ExplosivefeatureArr;
    }
    var features = [];
    var Cs = [0.03, 0.06, 0.15, 0.4];//经验常数，取决于伤害等级
    var colors = ["#4d1919", "#b40c08", "#e72319", "#f07675"];
    var vLV = ["一级", "二级", "三级", "四级"];
    for (var i = Cs.length - 1; i >= 0; i--) {
      var boomR = (Cs[i] * Math.pow((N * V * Hc), 1 / 3)).toFixed(1);//损害半径 m
      var r = boomR / (2 * Math.PI * 6378137.0) * 360;
      var r = parseFloat(boomR);
      var bufferCircle = new Circle(PointCoord, r, 'XY');
      AnalysisResultLyr.getSource().clear();
      var feature = new Feature({
        geometry: bufferCircle,
        zIndex: i
      });
      var featureObj = {
        "feature": feature,
        "roundHeart": PointCoord,
        "伤害等级": vLV[i],
        "经验常数": Cs[i],
        "损失半径": boomR,
        "单位": "m",

      }
      ExplosivefeatureArr.push(featureObj);

      feature.setStyle(new Style({
        stroke: new Stroke({
          color: colors[i],
          width: 10
        })
      }));
      var polygon = makeCircle(bufferCircle);
      var co = polygon.getCoordinates();
      co = co[0][Math.floor(co[0].length / 4)];
      var label = new Feature({
        geometry: new Point(co),
        zIndex: 500
      })
      label.setStyle(new Style({
        text: new Text({
          font: '14px 微软雅黑',
          fill: new Fill({ color: '#075db3' }),
          text: vLV[i] + ":" + boomR + 'm',
          rotation: 0,
          offsetY: 20,
          textBaseline: 'bottom'
        })
      }));
      features.push(feature);
      features.push(label);
    }
    console.log(features, 'features')
    AnalysisResultLyr.getSource().addFeatures(features);
    map.getView().fit(features[0].getGeometry().getExtent(), map.getSize());
    this.ExplosivefeatureArr = ExplosivefeatureArr;
    return AnalysisResultLyr;
  }




  //添加标准图层
  // var setLabelObj={
  // 	 text:"",
  // 	 color:"red",
  // 	 fontSize:14,
  // 	 fontfamily:"微软雅黑",
  // 	 rotation:0,
  // 	 offsetX:20,
  // 	 offsetY:20
  //  }
  var vLabelLyr = null;
  function addLabelToLayer(Coordinates, setLabelObj) {
    if (setLabelObj.text == "") {
      return;
    }
    if (vLabelLyr == null) {
      vLabelLyr = new VectorLayer({
        source: new VectorSource(),
        zIndex: 80
      });
      vLabelLyr.set("id", "vLabelLyr");
      map.addLayer(vLabelLyr);
    }
    var features = [];
    var label = new Feature({
      geometry: new Point(Coordinates),
      zIndex: 500
    })
    var vTextObj = {
      font: '14px 微软雅黑',
      fill: new Fill({ color: '#e72319' }),
      text: setLabelObj.text,
      textBaseline: 'bottom'
    };

    if (setLabelObj.fontSize != null) {
      if (setLabelObj.fontfamily != null) {
        vTextObj["font"] = setLabelObj.fontSize + "px " + setLabelObj.fontfamily;
      }
    }
    if (setLabelObj.color != null) {
      var vFill = new Fill({ color: setLabelObj.color });
      vTextObj["fill"] = vFill;
    }
    if (setLabelObj.rotation != null) {
      vTextObj["rotation"] = setLabelObj.rotation;
    }
    if (setLabelObj.offsetX != null) {
      vTextObj["offsetX"] = setLabelObj.offsetX;
    }
    if (setLabelObj.offsetY != null) {
      vTextObj["offsetY"] = setLabelObj.offsetY;
    }
    label.setStyle(new Style({
      text: new Text(vTextObj)
    }));
    features.push(label);
    vLabelLyr.getSource().addFeatures(features);
  }

  function clearLabelLayer() {
    if (vLabelLyr != null) {
      vLabelLyr.getSource().clear();
    }
  }

  var vMarkingLyr = null;
  function addMarkingToLayer(Coordinates, MarkingObj) {

    if (vMarkingLyr == null) {
      vMarkingLyr = new VectorLayer({
        source: new VectorSource(),
        zIndex: 80
      });
      vMarkingLyr.set("id", "vMarkingLyr");
      map.addLayer(vMarkingLyr);
    }
    var features = [];
    var vFeature = new Feature({
      geometry: new Point(Coordinates),
      zIndex: 500
    })
    var vStyle = new Style({
      image: new Icon({
        anchor: [1, 1],
        src: MarkingObj.img
      })
    })

    vFeature.setStyle(vStyle);
    features.push(vFeature);
    vMarkingLyr.getSource().addFeatures(features);
  }

  function clearMarkingLayer() {
    if (vMarkingLyr != null) {
      vMarkingLyr.getSource().clear();
    }
  }


  var measureDraw; // global so we can remove it later
  var sketch;
  var helpTooltipElement;
  var helpTooltip;
  var measureTooltipElement;
  var measureTooltip;
  var continuePolygonMsg = '双击结束绘面';
  var continueLineMsg = '双击结束绘线';

  function removeMeasureTooltip() {
    var divlist = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
    var vlength = divlist.length;
    for (var x = vlength - 1; x > -1; x--) {
      document.getElementsByClassName("ol-tooltip ol-tooltip-static")[x].parentElement.remove();
    }
  }
  function clearMeasure() {
    if (this.MeasureSource != null) {

      this.MeasureSource.clear();
      //map.removeLayer(this.MeasureVector);
      removeMeasureTooltip();
    }


  }
  function stopMeasure() {
    if (measureDraw != null) {
      map.removeInteraction(measureDraw);
    }
  }
  function addMeasureInteraction(DrawType) {
    var _this = this;
    if (_this.MeasureVector == null) {
      this.addMeasureSource();
    }
    // if(measureDraw!=null){
    // 	 map.removeInteraction(measureDraw);
    // }
    stopMeasure();
    //var type = (typeSelect== 'area' ? 'Polygon' : 'LineString');
    //DrawType='Polygon' |'LineString'
    measureDraw = new Draw({
      source: this.MeasureSource,
      type: DrawType,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 0.5)',
          lineDash: [10, 10],
          width: 2
        }),
        image: new CircleStyle({
          radius: 5,
          stroke: new Stroke({
            color: 'rgba(0, 0, 0, 0.7)'
          }),
          fill: new Fill({
            color: 'rgba(255, 255, 255, 0.2)'
          })
        })
      })
    });
    map.addInteraction(measureDraw);
    createMeasureTooltip();
    createHelpTooltip();

    measureDraw.on('drawstart', function (evt) {
      //var _this=this;
      // set sketch
      sketch = evt.feature;
      var tooltipCoord = evt.coordinate;
      _this.Measurelistener = sketch.getGeometry().on('change', function (evt) {
        var geom = evt.target;
        var output;
        if (geom instanceof Polygon) {
          // var geomproject = geom.transform('EPSG:4326','EPSG:3857');
          output = formatArea(geom);
          //output = formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof LineString) {
          // var geomproject = geom.transform('EPSG:4326','EPSG:3857');
          output = formatLength(geom);
          //output = formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
    });
    measureDraw.on('drawend', function () {
      //var _this=this;
      measureTooltipElement.className = 'ol-tooltip ol-tooltip-static';
      measureTooltip.setOffset([0, -7]);
      // unset sketch
      sketch = null;
      // unset tooltip so that a new one can be created
      measureTooltipElement = null;
      createMeasureTooltip();
      Observable.unByKey(this.Measurelistener);
      stopMeasure();
    });
  }

  function addMeasureSource() {
    this.MeasureSource = new VectorSource();
    this.MeasureVector = new VectorLayer({
      source: this.MeasureSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: '#ffcc33',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: '#ffcc33'
          })
        })
      })
    });
    map.addLayer(this.MeasureVector);
  }

  //Handle pointer move.
  function pointerMoveHandler(evt) {
    if (evt.dragging) {
      return;
    }
    var helpMsg = '点击开始测量';
    if (sketch) {
      var geom = sketch.getGeometry();
      if (geom instanceof Polygon) {
        helpMsg = continuePolygonMsg;
      } else if (geom instanceof LineString) {
        helpMsg = continueLineMsg;
      }
    }
    helpTooltipElement.innerHTML = helpMsg;
    helpTooltip.setPosition(evt.coordinate);
    helpTooltipElement.className = "ol-tooltip ";
  };

  // Format length output.
  var formatLength = function (line) {
    console.log("line", line)
    var length = sphere.getLength(line);
    var output;
    length = length * 111000;
    if (length > 100) {
      output = (Math.round(length / 1000 * 100) / 100) +
        ' ' + 'km';
    } else {
      output = (Math.round(length * 100) / 100) +
        ' ' + 'm';
    }
    return output;
  };


  //Format area output.
  var formatArea = function (polygon) {
    console.log("polygon",polygon)
    var area = sphere.getArea(polygon);
    var output;
    console.log(area,1213312)
    if (area > 10000) {
      output = (Math.round(area / 1000000 * 100) / 100) +
        ' ' + 'km<sup>2</sup>';
    } else {
      output = (Math.round(area * 100) / 100) +
        ' ' + 'm<sup>2</sup>';
    }
    return output;
  };

  //Creates a new help tooltip
  function createHelpTooltip() {
    if (helpTooltipElement) {
      helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'ol-tooltip hidden';
    helpTooltip = new Overlay({
      element: helpTooltipElement,
      offset: [15, 0],
      positioning: 'center-left'
    });
    map.addOverlay(helpTooltip);
  }

  // Creates a new measure tooltip
  function createMeasureTooltip() {
    if (measureTooltipElement) {
      measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
  }




  //地图容器大小重置
  function setSize() {
    let width = document.getElementById(_this._MapConfig.container).clientWidth;
    let height = document.getElementById(_this._MapConfig.container).clientHeight;
    map.setSize([width, height]);
  }

  function getTextByEsri(labelInfo) {
    if (!labelInfo) return null;
    var labelSymbol = labelInfo[0].symbol.symbolLayers[0];
    var size = labelSymbol.size;
    var color = labelSymbol.material.color;
    var xoffset = labelSymbol.xoffset;
    var yoffset = labelSymbol.yoffset;
    return {
      field: labelInfo[0].labelExpressionInfo.value.replace("{", "").replace("}", ""),
      xoffset: xoffset ? xoffset : 0,
      yoffset: yoffset,
      fillColor: color,
      font: "normal " + size + "px sans-serif",
    };
  }



  var AnalysisLyr = null;
  var AnalysisResultLyr = null;
  var AnalysisPointCoord = null;
  var AnalysisDrawTool = null;

  //设置分析绘点图层
  function AnalysisPointLayer() {
    AnalysisLyr = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        image: new CircleStyle({
          radius: 2,
          fill: new Fill({
            color: "rgba(0,0,0,0)"
          })
        })
      }),
      zIndex: 90
    });
    map.addLayer(AnalysisLyr);
  }

  //销毁分析图层与绘图工具
  function destroyAnalysisLayer() {
    if (AnalysisLyr) {
      map.removeLayer(AnalysisLyr);
      AnalysisLyr = null;
    }
    if (AnalysisResultLyr) {
      map.removeLayer(AnalysisResultLyr);
      AnalysisResultLyr = null;
    }
    if (AnalysisDrawTool) {
      map.removeInteraction(AnalysisDrawTool);
      AnalysisDrawTool = null;
    }
  };

  //绘制分析点
  function drawAnalysisPoint(drawCallback) {
    destroyAnalysisLayer();
    AnalysisPointLayer();
    // 清空图层
    AnalysisLyr.getSource().clear();
    if (AnalysisResultLyr != null) {
      AnalysisResultLyr.getSource().clear();
    }
    if (AnalysisDrawTool) return;
    AnalysisDrawTool = new Draw({
      source: AnalysisLyr.getSource(),
      type: 'Point',
      style: new Style({
        image: new Icon({
          src: '', //require("@/assets/point.png"),
          anchor: [0.5, 1]
        })
      })
    });
    map.addInteraction(AnalysisDrawTool);
    AnalysisDrawTool.on('drawend', function (e) {
      // body...
      map.removeInteraction(AnalysisDrawTool);
      AnalysisDrawTool = null;
      var PointCoord = e.feature.getGeometry().getCoordinates();
      drawCallback(PointCoord);
      e.feature.setStyle(new Style({
        image: new Icon({
          src: '', // require('@/assets/point.png'),
          size: [32, 32],
          anchor: [0.5, 0.5]
        })
      }));

    });
  }



  // V 气体体积 m3
  // Hc 可燃气体高燃烧热值 kJ/m3
  // Cs = [0.06, 0.15, 0.4];//经验常数，取决于伤害等级
  //爆炸影响范围分析
  function ExplosiveAnalysis(PointCoord, V, Hc, N) {
    if (AnalysisResultLyr) {
      map.removeLayer(AnalysisResultLyr);
      AnalysisResultLyr = null;
    }
    else {
      AnalysisResultLyr = new VectorLayer({
        source: new VectorSource(),
        zIndex: 80

      });
      map.addLayer(AnalysisResultLyr);
    }

    if (!PointCoord) {
      alert('请绘制爆炸发生位置！');
      return;
    }
    if (!V || V <= 0) {
      alert('输入爆炸气体体积并且不能为负值！');
      return;
    }
    var features = [];
    var Cs = [0.03, 0.06, 0.15, 0.4];//经验常数，取决于伤害等级
    var colors = ["#7E0000", "#990000", "#FF0000", "#FF7E00"];
    var vLV = ["一级", "二级", "三级", "四级"];
    for (var i = Cs.length - 1; i >= 0; i--) {
      var boomR = (Cs[i] * Math.pow((N * V * Hc), 1 / 3)).toFixed(1);//损害半径 m
      var r = boomR / (2 * Math.PI * 6378137.0) * 360;
      var r = parseFloat(boomR);
      var bufferCircle = new Circle(PointCoord, r, 'XY');
      AnalysisResultLyr.getSource().clear();
      var feature = new Feature({
        geometry: bufferCircle,
        zIndex: i
      });
      feature.setStyle(new Style({
        stroke: new Stroke({
          color: colors[i],
          width: 10
        })
      }));
      var polygon = makeCircle(bufferCircle);
      var co = polygon.getCoordinates();
      co = co[0][Math.floor(co[0].length / 4)];
      var label = new Feature({
        geometry: new Point(co),
        zIndex: 500
      })
      label.setStyle(new Style({
        text: new Text({
          font: '14px 微软雅黑',
          fill: new Fill({ color: '#075db3' }),
          text: vLV[i] + ":" + boomR + 'm',
          rotation: 0,
          offsetY: 20,
          textBaseline: 'bottom'
        })
      }));
      features.push(feature);
      features.push(label);
    }
    AnalysisResultLyr.getSource().addFeatures(features);
    map.getView().fit(features[0].getGeometry().getExtent(), map.getSize());
  }




  //加点
  function addPoints(options) {
    //初始化-点位数据
    var gras = options.gra;
    let vectorSource;
    if (gras.type == 'FeatureCollection') {
      vectorSource = new VectorSource({
        features: (new GeoJSON()).readFeatures(gras,
          {
            dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
            featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
          }
        )
      });
    } else if (gras.geometryType) {
      vectorSource = new VectorSource({
        features: (new EsriJSON()).readFeatures(gras,
          {
            dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
            featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
          }
        )
      });
    }

    //初始化-渲染样式
    var styleFunction = function (feature, resolution) {
      if (options.map) {
        if (options.map.symbol) {
          var styleInfo = options.map.symbol;
          var textInfo = options.map.text ? options.map.text : getTextByEsri(options.map.label);
          return getRender(feature, styleInfo, textInfo, resolution);
        } else if (options.map.text) {
          var textInfo = options.map.text;
          return getRender(feature, null, textInfo, resolution);
        }
      }
      else if (feature.getProperties()._symbol) {
        let symbolInfo = feature.getProperties()._symbol;
        let textInfo = feature.getProperties()._text;
        return getSymbol(symbolInfo, feature, textInfo, resolution);
      }
      else {
        return styles[feature.getGeometry().getType()];
      }
    }

    //添加图层
    var vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction,
      minResolution: options.minZoom ? Resolutions[options.maxZoom] : options.minResolution,
      maxResolution: options.maxZoom ? Resolutions[options.minZoom] : options.minResolution,
      zIndex: options.zIndex,
    });

    if (options.id) {
      layerClear(options.id);
      vectorLayer.set("id", options.id);
    }

    map.addLayer(vectorLayer);
    _this.layerlist.push(vectorLayer);

    //绑定事件--点击
    if (options.popup) {
      if ((typeof options.popup) == "function") {
        vectorLayer.popupFunction = options.popup;
        this.eventlist.push(vectorLayer);
      }
    }

    //绑定事件--鼠标滑过
    if (options.tooltip) {
      if ((typeof options.tooltip) == "function") {
        vectorLayer.tooltipFunction = options.tooltip;
        this.overlist.push(vectorLayer);
      }
    }

    //图层自适应
    if (options.zoom) {
      mapfit(vectorLayer, options.zoom);
    }

    //加载后是否显示
    if (options.show != undefined) {
      vectorLayer.setVisible(options.show);
    }
  }

  //加线
  function addLines(options) {
    //初始化-点位数据
    var gras = options.gra;
    let vectorSource;
    if (gras.type == 'FeatureCollection') {
      vectorSource = new VectorSource({
        features: (new GeoJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
        })
      });
    } else if (gras.geometryType) {
      vectorSource = new VectorSource({
        features: (new EsriJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
        })
      });
    }


    //初始化-渲染样式
    var styleFunction = function (feature, resolution) {
      if (options.map) {
        if (options.map.symbol) {
          var styleInfo = options.map.symbol;
          var textInfo = options.map.text;
          return getRender(feature, styleInfo, textInfo, resolution);
        } else if (options.map.text) {
          var textInfo = options.map.text;
          return getRender(feature, null, textInfo, resolution);
        }
      }
      else if (feature.getProperties()._symbol) {
        let symbolInfo = feature.getProperties()._symbol;
        let textInfo = feature.getProperties()._text;
        return getSymbol(symbolInfo, feature, textInfo, resolution);
      }
      else {
        return styles[feature.getGeometry().getType()];
      }
    }

    //添加图层
    var vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction,
      minResolution: options.minZoom ? Resolutions[options.maxZoom] : options.minResolution,
      maxResolution: options.maxZoom ? Resolutions[options.minZoom] : options.minResolution,
      zIndex: options.zIndex,
    });

    if (options.id) {
      layerClear(options.id);
      vectorLayer.set("id", options.id);
    }

    map.addLayer(vectorLayer);
    this.layerlist.push(vectorLayer);

    //绑定事件
    if (options.popup) {
      if ((typeof options.popup) == "function") {
        vectorLayer.popupFunction = options.popup;
        this.eventlist.push(vectorLayer);
      }
    }

    //图层自适应
    if (options.zoom) {
      mapfit(vectorLayer, options.zoom);
    }

    //加载后是否显示
    if (options.show != undefined) {
      vectorLayer.setVisible(options.show);
    }
  }


 function fitLayerExtent(options) {
    //放大到图层
    var gras = options.gra;
    let vectorSource;
    if (gras.type == 'FeatureCollection') {
      vectorSource = new VectorSource({
        features: (new GeoJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
        })
      });
    } else if (gras.geometryType) {
      vectorSource = new VectorSource({
        features: (new EsriJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
        })
      });
    }
	var vectorLayer = new VectorLayer({
	  source: vectorSource,
	});
	 map.getView().fit(vectorLayer.getSource().getExtent());
}

  //加面
  function addPolygons(options) {
    //初始化-点位数据
    var gras = options.gra;
    let vectorSource;
    if (gras.type == 'FeatureCollection') {
      vectorSource = new VectorSource({
        features: (new GeoJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
        })
      });
    } else if (gras.geometryType) {
      vectorSource = new VectorSource({
        features: (new EsriJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
        })
      });
    }


    //初始化-渲染样式
    var styleFunction = function (feature, resolution) {
      if (options.map) {
        if (options.map.symbol) {
          var styleInfo = options.map.symbol;
          var textInfo = options.map.text;
          return getRender(feature, styleInfo, textInfo, resolution);
        } else {
          var textInfo = options.map.text;
          return getRender(feature, null, textInfo, resolution);
        }
      }
      else if (feature.getProperties()._symbol) {
        let symbolInfo = feature.getProperties()._symbol;
        let textInfo = feature.getProperties()._text;
        return getSymbol(symbolInfo, feature, textInfo, resolution);
      }
      else {
        return styles[feature.getGeometry().getType()];
      }
    }



    //初始化图层
    var vectorLayer = new VectorLayer({
      source: vectorSource,
      style: styleFunction,
      minResolution: options.minZoom ? Resolutions[options.maxZoom] : options.minResolution,
      maxResolution: options.maxZoom ? Resolutions[options.minZoom] : options.minResolution,
      zIndex: options.zIndex,
    });

    if (options.id) {
      layerClear(options.id);
      vectorLayer.set("id", options.id);
    }

    //添加到地图
    if (map) {
      map.addLayer(vectorLayer);
    } else {
      createMap({ baselayers: [vectorLayer] });
    }

    this.layerlist.push(vectorLayer);

    //绑定事件
    if (options.popup) {
      if ((typeof options.popup) == "function") {
        vectorLayer.popupFunction = options.popup;
        this.eventlist.push(vectorLayer);
      }
    }

    //绑定事件--鼠标滑过
    if (options.tooltip) {
      if ((typeof options.tooltip) == "function") {
        vectorLayer.tooltipFunction = options.tooltip;
        this.overlist.push(vectorLayer);
      }
    }

    if (options.zoom) {
      mapfit(vectorLayer);
    }

    //加载后是否显示
    if (options.show != undefined) {
      vectorLayer.setVisible(options.show);
    }
  }

  //叠加图片
  function addImage(options) {
    var imgExtent = options.extent;
    var min = proj.fromLonLat([imgExtent[0], imgExtent[1]], map.getView().getProjection().code_);
    var max = proj.fromLonLat([imgExtent[2], imgExtent[3]], map.getView().getProjection().code_);
    var layerExtent = [min[0], min[1], max[0], max[1]];
    if (!this.imgLayer) {
      this.imgLayer = new ImageLayer({
        source: new ImageStatic({
          url: options.url,
          projection: map.getView().getProjection(),
          imageExtent: layerExtent,
        }),
        opacity: options.opacity,
        minResolution: options.minResolution,
        maxResolution: options.maxResolution,
      })
      map.addLayer(this.imgLayer);
    }
    else {
      this.imgLayer.setSource(new ImageStatic({
        url: options.url,
        projection: map.getView().getProjection(),
        imageExtent: layerExtent,
      }))
    }

  }





  //热力图
  function addHeatmap(options) {
    //初始化-点位数据
    var gras = options.gra;
    var vectorSource;
    if (gras.type == 'FeatureCollection') {
      vectorSource = new VectorSource({
        features: (new GeoJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
        })
      });
    } else if (gras.geometryType) {
      vectorSource = new VectorSource({
        features: (new EsriJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
        })
      });
    }

    var vectorLayer = new Heatmap({
      source: vectorSource,
      weight: options.field,
      blur: options.blur,
      radius: options.radius,
      minResolution: options.minZoom ? Resolutions[options.maxZoom] : options.minResolution,
      maxResolution: options.maxZoom ? Resolutions[options.minZoom] : options.minResolution,
      zIndex: options.zIndex,
    });

    if (options.id) {
      layerClear(options.id);
      vectorLayer.set('id', options.id)
    }

    if (options.zoom) {
      mapfit(vectorLayer);
    }

    map.addLayer(vectorLayer);
    this.layerlist.push(vectorLayer);

    //加载后是否显示
    if (options.show != undefined) {
      vectorLayer.setVisible(options.show);
    }
  }

  //风场
  function addWindy(options) {
    var _this = this;
    var canvas, windy;
    var windData = options.data;
    var windType = options.type;
    var legends = { "unit": "m/s", "name": "风速", "list": [{ "productcode": "SURF_CHN_MUL_HOR", "name": "1.6", "rule": ",1.6", "iconUrl": "/wind/1.png", "color": "#0099FF", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 1, "reqFlag": 0, "id": 240 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "3.4", "rule": "1.6,3.4", "iconUrl": "/wind/2.png", "color": "#0067FF", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 2, "reqFlag": 0, "id": 241 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "5.5", "rule": "3.4,5.5", "iconUrl": "/wind/3.png", "color": "#2F9A00", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 3, "reqFlag": 0, "id": 242 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "8.0", "rule": "5.5,8.0", "iconUrl": "/wind/4.png", "color": "#26FF00", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 4, "reqFlag": 0, "id": 243 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "10.8", "rule": "8.0,10.8", "iconUrl": "/wind/5.png", "color": "#D2FE09", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 5, "reqFlag": 0, "id": 244 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "13.9", "rule": "10.8,13.9", "iconUrl": "/wind/6.png", "color": "#FCFE00", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 6, "reqFlag": 0, "id": 245 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "17.2", "rule": "13.9,17.2", "iconUrl": "/wind/7.png", "color": "#F3D42F", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 7, "reqFlag": 0, "id": 246 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "20.8", "rule": "17.2,20.8", "iconUrl": "/wind/8.png", "color": "#FB9B03", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 8, "reqFlag": 0, "id": 247 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "24.5", "rule": "20.8,24.5", "iconUrl": "/wind/9.png", "color": "#DEC4C3", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 9, "reqFlag": 0, "id": 248 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "28.5", "rule": "24.5,28.5", "iconUrl": "/wind/10.png", "color": "#CC9591", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 10, "reqFlag": 0, "id": 249 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "32.7", "rule": "28.5,32.7", "iconUrl": "/wind/11.png", "color": "#904B45", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 11, "reqFlag": 0, "id": 250 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "37.0", "rule": "32.7,37.0", "iconUrl": "/wind/12.png", "color": "#FF3333", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 12, "reqFlag": 0, "id": 251 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "41.5", "rule": "37.0,41.5", "iconUrl": "/wind/13.png", "color": "#D2393A", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 13, "reqFlag": 0, "id": 252 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "46.2", "rule": "41.5,46.2", "iconUrl": "/wind/14.png", "color": "#B23737", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 14, "reqFlag": 0, "id": 253 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "51.0", "rule": "46.2,51.0", "iconUrl": "/wind/15.png", "color": "#B233B2", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 15, "reqFlag": 0, "id": 254 }, { "productcode": "SURF_CHN_MUL_HOR", "name": "56.1", "rule": "51.0,56.1", "iconUrl": "/wind/16.png", "color": "#DE37E1", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 16, "reqFlag": 0, "id": 255 }, { "productcode": "SURF_CHN_MUL_HOR", "name": " ", "rule": "56.1,", "iconUrl": "/wind/17.png", "color": "#F237E1", "element": ",WIN_S_Max,WIN_S_Avg_2mi,WIN_S_Avg_10mi,WIN_S_INST,WIN_S_Inst_Max,t1.v11042,t1.v11291,t1.v11202,t1.v11046,t1.v11293,", "invalid": 0, "orderNo": 17, "reqFlag": 0, "id": 256 }] }
    addWindMap();
    function addWindMap() {
      var canvas1 = document.createElement('canvas');
      canvas1.id = options.id ? options.id + '_color' : "colorCanvas";
      canvas1.width = map.getSize()[0];
      canvas1.height = map.getSize()[1];
      canvas1.style.position = 'absolute';
      canvas1.style.top = 0;
      canvas1.style.left = 0;
      map.getViewport().appendChild(canvas1);
      if (options.showBack == false) {
        canvas1.style.display = 'none';
      }
      canvas = document.createElement('canvas');
      canvas.id = options.id ? options.id : "windCanvas";
      canvas.width = map.getSize()[0];
      canvas.height = map.getSize()[1];
      canvas.style.position = 'absolute';
      canvas.style.top = 0;
      canvas.style.left = 0;
      map.getViewport().appendChild(canvas);
      if (windType == "grid") {

        //var options = _extends({ canvas: self._canvasLayer._canvas, canvasOverlay: self._canvasOverLayer._canvas }, self.options);
        windy = new WindyGrid({
          canvas: canvas,
          canvasOverlay: canvas1,
          data: windData,
          colorScalar: getColorFunction(legends),
          //colorScale: ["#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff"],
          //colorScale: ["#00f", "#00f", "#00f", "#00f", "#00f", "#00f", "#00f", "#00f", "#00f", "#00f", "#00f", "#00f", "#00f"],
          colorScale: options.colorScale ? options.colorScale : ["#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff", "#fff"],
          displayOptions: {
            displayEmptyString: "No wind data",
            displayPosition: "bottomleft",
            velocityType: "Wind",
          },
          displayValues: true,
          frameRate: 18,
          lineWidth: options.lineWidth || 1,
          particleAge: options.particleAge || 40,
          particleMultiplier: options.particleMultiplier || 0.00125,
          velocityScale: options.velocityScale || 0.02,
          tooltip: options.tooltip,
          //qlupdate 传入坐标系统
          crs: view.getProjection().getCode(),
        });
        windGridDraw();
      } else {
        windy = new WindyStn({
          map: map,
          canvas: canvas,
          data: windData
        });
        var option = {
          size: options.lineWidth ? options.lineWidth : .8,
          color: options.color ? options.color : 'rgba(0,0,0,0.6)',
        };
        windy.change(option);
        windStnDraw();
      }

      _this.layerlist.push(canvas);
      _this.layerlist.push(canvas1);

      map.getView().on('propertychange', function () {
        windy.stop();
        //$(canvas).hide();
      });
      map.on("moveend", function () {
        if (windType == "grid") {
          windGridDraw();
        } else {
          windStnDraw();
        }
      });
    }

    function getColorFunction(legends) {
      var list = legends.list;
      var scale = [];
      var color = [];
      var data = [];


      list.forEach(function (item, index) {
        if (index == 0) {
          scale.push(0);
          var color1 = item.color;
          color1 = color1.colorRgb();
          data.push([0, color1])
        }
        var name = +item.name
        scale.push(+name);
        var color1 = item.color;
        color1 = color1.colorRgb();
        data.push([+name, color1]);
      });

      var color2 = segmentedColorScale(data);

      return function (value) {
        return color2(value, 180);
      };
    }
    /*
    function windGridDraw() {
      debugger
      //var extent = map.frameState_.extent;
      //var minCoord = toLonLat([extent[0], extent[1]]);
      //var maxCoord = toLonLat([extent[2], extent[3]]);
      //var minCoord = fromLonLat([extent[0], extent[1]]);
      //var maxCoord = fromLonLat([extent[2], extent[3]]);
      var extent = map.frameState_.extent;
      var minCoord = toLonLat([extent[0], extent[1]]);
      var maxCoord = toLonLat([extent[2], extent[3]]);
      var vWidth = document.getElementById("map").clientWidth;
      var vHeight = document.getElementById("map").clientHeight;
      var size = [vWidth, vHeight]
      // bounds, width, height, extent
      windy.start(
        [[0, 0], size],
        size[0],
        size[1],
        [minCoord, maxCoord]
      );

    }
*/
    //qlupdate 解决4326坐标系的风场计算
    function windGridDraw() {
      var size = map.getSize();
      var crs = view.getProjection().getCode();
      var bounds = map.getView().calculateExtent();
      var _min,minCoord = [];
      var _max,maxCoord = [];
      if (crs.indexOf('4326') > -1) {
          _min = proj.fromLonLat([bounds[0], bounds[1]]);
          _max = proj.fromLonLat([bounds[2], bounds[3]]);
      } else {
          _min = [bounds[0], bounds[1]];
          _max = [bounds[2], bounds[3]];
      }
      var py = map.getPixelFromCoordinate([bounds[0], bounds[3]]); //经纬度转成屏幕坐标
      canvas.style.left = py.x + 'px';
      canvas.style.top = py.y + 'px';
      var min = map.getPixelFromCoordinate([bounds[0], bounds[1]]);
      var max = map.getPixelFromCoordinate([bounds[2], bounds[3]]);
      if (crs.indexOf('4326') > -1) {
         minCoord = [bounds[0], bounds[1]];
         maxCoord = [bounds[2], bounds[3]];
      } else {
         minCoord = proj.toLonLat(_min);
         maxCoord = proj.toLonLat(_max);
      }
      if (maxCoord[0] < 0) maxCoord[0] += 360;
      var extent = [
        [min[0] - py[0], max[1] - py[1]],
        [max[0] - py[0], min[1] - py[1]]
      ];
      // bounds, width, height, extent
      windy.start(
        [[0, 0], size],
        size[0],
        size[1],
        [minCoord, maxCoord]
      );

    }

    function windStnDraw() {
      //$(canvas).show();
      var bounds = map.getView().calculateExtent();
      var _min = [bounds[0], bounds[1]];
      var _max = [bounds[2], bounds[3]];
      var py = map.getPixelFromCoordinate([bounds[0], bounds[3]]); //经纬度转成屏幕坐标
      canvas.style.left = py.x + 'px';
      canvas.style.top = py.y + 'px';
      var points = invertLatLon(py); //所有站点经纬度转为canvas坐标
      var min = map.getPixelFromCoordinate(_min);
      var max = map.getPixelFromCoordinate(_max);
      var extent = [
        [min[0] - py[0], max[1] - py[1]],
        [max[0] - py[0], min[1] - py[1]]
      ];
      windy.start(extent, points);
    }


    function invertLatLon(py) {
      var points = [];
      windData.forEach(function (station) {
        var xy = proj.fromLonLat([station[0], station[1]], map.getView().getProjection().code_);
        var px = map.getPixelFromCoordinate([xy[0], xy[1]]);
        points.push({
          x: px[0] - py[0],
          y: px[1] - py[1],
          angle: station[2],
          speed: station[3]
        });
      });
      return points;
    }

  }

  //加点飞线
  function addPointlink(options) {

    var points = options.data;
    var planePath = 'path://M1705.06,1318.313v-89.254l-319.9-221.799l0.073-208.063c0.521-84.662-26.629-121.796-63.961-121.491c-37.332-0.305-64.482,36.829-63.961,121.491l0.073,208.063l-319.9,221.799v89.254l330.343-157.288l12.238,241.308l-134.449,92.931l0.531,42.034l175.125-42.917l175.125,42.917l0.531-42.034l-134.449-92.931l12.238-241.308L1705.06,1318.313z';
    //构建字典数据
    var data = {};
    for (let i = 0; i < points.length; i++) {
      let key = points[i].id;
      data[key] = [parseFloat(points[i].lon), parseFloat(points[i].lat)]
    }
    //坐标转换
    for (let i in data) {
      var point = proj.fromLonLat(data[i], map.getView().getProjection().code_);
      data[i] = point;
    }
    //构建连线图数据
    var linesData = [], pointsData = [];
    for (let i = 0; i < points.length; i++) {
      let ckey = points[i].id;
      let nkey = points[i].nid;
      pointsData.push({
        name: points[i].name,
        value: [data[ckey][0], data[ckey][1], 20]
      })
      if (!nkey) continue;
      linesData.push([
        { coord: data[ckey] }, { coord: data[nkey] }
      ]);

    }
    //生产连线图
    var colors = ["#c00", "#ffa022", "#a6c84c", "#ffa022", "#46bee9"];
    var lineColor = colors[0];
    var series = [
      {
        name: '',
        type: 'lines',
        zlevel: 1,
        effect: {
          show: true,
          period: 4,
          trailLength: 0.7,
          color: '#ddd',
          symbolSize: 3
        },
        lineStyle: {
          normal: {
            color: lineColor,
            width: 0.1,
            curveness: 0.2
          }
        },
        data: linesData
      },
      {
        name: '',
        type: 'lines',
        zlevel: 2,
        effect: {
          show: true,
          period: 4,
          trailLength: 0,
          symbol: planePath,
          //symbol: 'arrow',
          color: '#FFAA25',
          symbolSize: 20
        },
        lineStyle: {
          normal: {
            color: lineColor,
            width: 0,
            opacity: 0.1,
            curveness: 0.2
          }
        },
        data: linesData
      },
      {
        name: '',
        type: 'effectScatter',
        coordinateSystem: 'geo',
        zlevel: 2,
        rippleEffect: {
          brushType: 'stroke'
        },
        label: {
          normal: {
            show: false,
            position: 'right',
            formatter: '{b}'
          }
        },
        symbolSize: function (val) {
          return val[2] / 8;
        },
        itemStyle: {
          normal: {
            color: lineColor
          }
        },
        data: pointsData
      }];
    var option = {
      tooltip: {
        trigger: 'item'
      },
      legend: {
        show: false,
      },
      geo: {
        label: {
          emphasis: {
            show: false
          }
        },
        roam: true,
        itemStyle: {
          normal: {
            areaColor: '#323c48',
            borderColor: '#404a59'
          },
          emphasis: {
            areaColor: '#2a333d'
          }
        }
      },
      series: series
    };
    var oe = new ADLayer(option, map, echarts);
    oe.render()

  }

  //覆盖图层
  function addOverlays(options) {
    layerClear(options.id);
    let tmpdivIds = [];
    var targetlayers = this.layerlist.filter(layer => {
      let layerId = layer.id ? layer.id : layer.get("id");
      if (layerId == options.targetlayer) return true;
    })
    if (targetlayers.length > 0) {
      var features = targetlayers[0].getSource().getFeatures();
      features.forEach(feature => {
        var coordinate = extent.getCenter(feature.getGeometry().getExtent());
        var code = feature.getProperties()[options.codeField];
        let overlayerId = options.id + "_" + code;
        var tmpLayer = createOverlay(overlayerId, options.popup, feature, options.tooltip);
        tmpLayer.set("id", overlayerId);
        tmpLayer.setPosition(coordinate);

        map.addOverlay(tmpLayer);
        _this.layerlist.push(tmpLayer);
        tmpdivIds.push(overlayerId);

        if (options.minResolution || options.maxResolution || options.minZoom || options.maxZoom) {
          options.minResolution = options.minZoom ? Resolutions[options.maxZoom] : options.minResolution,
            options.maxResolution = options.maxZoom ? Resolutions[options.minZoom] : options.maxResolution,
            //监听缩放
            addMapEvent("moveend", function (e) {
              var resolution = e.target.getView().getResolution();
              if (resolution < options.minResolution || resolution > options.maxResolution) {
                tmpLayer.element.style.display = "none";
              }
              else {
                tmpLayer.element.style.display = "block";
              }
            })
          //首次判断
          var resolution = map.getView().getResolution();
          if (resolution < options.minResolution || resolution > options.maxResolution) {
            tmpLayer.element.style.display = "none";
          }
          else {
            tmpLayer.element.style.display = "block";
          }

        }
      })
      options.callback(tmpdivIds);
    }

    //加载后是否显示
    if (options.show != undefined) {
      setLayerVisible(options.id, options.show);
    }

    function createOverlay(overlayerId, popup, feature, tooltip) {
      var tmpDiv = document.createElement("div");
      tmpDiv.id = overlayerId;
      tmpDiv.className = options.className;
      tmpDiv.innerHTML = options.innerHTML;
      if (popup) {
        tmpDiv.addEventListener("click", (event) => {
          let popupInfo = popup({
            event: event,
            attributes: feature,
            properties: feature,
            layerId: options.id
          });
        })
      }
      if (tooltip) {
        tmpDiv.addEventListener("mouseover", () => {
          let tooltipInfo = tooltip(feature);
        })
      }
      //document.body.append(tmpDiv);
      var tmpLayer = new Overlay({
        element: tmpDiv,
        autoPan: true,
        autoPanAnimation: {
          duration: 250
        },
        offset: [options.xoffset ? options.xoffset : 0, options.yoffset ? options.yoffset : 0],
      });

      return tmpLayer;
    }

  }

  //添加服务图层
  function addServerLayer(options) {
    let vectorLayer = getLayerByType(options.type, options);
    if (options.id) {
      layerClear(options.id);
      vectorLayer.set('id', options.id);
    }

    map.addLayer(vectorLayer);
    this.layerlist.push(vectorLayer);

    if (options.zoom) {
      mapfit(vectorLayer);
    }

    if (options.layerCenter) {
      flyTo({
        center: options.layerCenter,
        zoom: options.layerZoom,
      })
    }
  }

  //根据类型生成图层
  function getLayerByType(type, layerInfo) {
    let layer;
    let crossOrigin;
    if (_this._MapConfig.proxy) {
      crossOrigin = "anonymous";
      //更新底图地址
      _this._MapConfig.proxy.forEach(proxy => {
        if (layerInfo.url) {
          if (layerInfo.url.indexOf(proxy.source) > -1) {
            layerInfo.url = layerInfo.url.replace(proxy.source, proxy.proxy)
          }
        }
      })
    }
    var crs = layerInfo.crs ? layerInfo.crs : 'EPSG:3857';
    var projection = proj.get(crs);
    switch (type) {
      case "esri":
        layer = new ImageLayer({
          source: new ImageArcGISRest({
            ratio: 1,
            params: {},
            crossOrigin: crossOrigin,
            url: layerInfo.url
          }),
          zIndex: layerInfo.zIndex,
        })
        break;
      case "esritiled":
        layer = new TileLayer({
          source: new TileArcGISRest({
            crossOrigin: crossOrigin,
            url: layerInfo.url
          }),
          zIndex: layerInfo.zIndex,
        })
        break;
      case "esrilayer":
        //获取样式配置
        var layerRenderer;
        var pjsonUrl = layerInfo.url + "?f=pjson";
        getUrl(pjsonUrl, function (pjsonstr) {
          var pjson = JSON.parse(pjsonstr);
          layerRenderer = pjson.drawingInfo.renderer;
        })
        //加载数据源
        var esrijsonFormat = new EsriJSON();
        var vectorSource = new VectorSource({
          loader: function (extent, resolution, projection) {
            var url = layerInfo.url + '/query/?f=json&' +
              'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
              encodeURIComponent('{"xmin":' + extent[0] + ',"ymin":' +
                extent[1] + ',"xmax":' + extent[2] + ',"ymax":' + extent[3] +
                ',"spatialReference":{"wkid":102100}}') +
              '&geometryType=esriGeometryEnvelope&inSR=102100&outFields=*' +
              '&outSR=102100';
            getUrl(url, function (response) {
              if (response.error) {
                alert(response.error.message + '\n' +
                  response.error.details.join('\n'));
              } else {
                // dataProjection will be read from document
                var features = esrijsonFormat.readFeatures(response, {
                  featureProjection: projection
                });
                if (features.length > 0) {
                  vectorSource.addFeatures(features);
                }
              }
            })
          },
          strategy: tileStrategy(createXYZ({
            tileSize: 512
          }))
        });
        layer = new VectorLayer({
          source: vectorSource,
          style: function (feature) {
            return getRender(feature, layerRenderer);
          },
          zIndex: layerInfo.zIndex,
        })
        break;
      case "baidu":
        // 自定义分辨率和瓦片坐标系
        var resolutions = [];
        var maxZoom = 18;

        // 计算百度使用的分辨率
        for (var j = 0; j <= maxZoom; j++) {
          resolutions[j] = Math.pow(2, maxZoom - j);
        }
        var tilegrid = new TileGrid({
          origin: [0, 0],    // 设置原点坐标
          resolutions: resolutions    // 设置分辨率
        });

        // 创建百度地图的数据源
        var baiduSource = new TileImage({
          projection: 'EPSG:3857',
          tileGrid: tilegrid,
          tileUrlFunction: function (tileCoord, pixelRatio, proj) {
            var z = tileCoord[0];
            var x = tileCoord[1];
            var y = tileCoord[2];

            // 百度瓦片服务url将负数使用M前缀来标识
            if (x < 0) {
              x = 'M' + (-x);
            }
            if (y < 0) {
              y = 'M' + (-y);
            }
            return layerInfo.url.replace(/{x}/, x).replace(/{y}/, y).replace(/{z}/, z);
          }
        })
        layer = new TileLayer({
          source: baiduSource,
        });
        break;
      case "osm":
        layer = new TileLayer({
          source: new OSM(),
          zIndex: layerInfo.zIndex,
        })
        break;
      case "wms":
        if (layerInfo.params) {
          if (layerInfo.params.TILED) {
            layer = new TileLayer({
              source: new TileWMS({
                url: layerInfo.url,
                params: layerInfo.params,
                serverType: layerInfo.params.serverType,
                //tileGrid: tileGrid
              }),
              zIndex: layerInfo.zIndex,
            })
          }
          layer = new ImageLayer({
            ratio: 1,
            source: new ImageWMS({
              url: layerInfo.url,
              params: layerInfo.params,
              serverType: layerInfo.serverType,
            }),
            zIndex: layerInfo.zIndex,
          })
        }
        else {
          layer = new ImageLayer({
            ratio: 1,
            source: new ImageWMS({
              url: layerInfo.url,
              params: layerInfo.params,
              serverType: layerInfo.serverType,
            }),
            zIndex: layerInfo.zIndex,
          })
        }

        break;
      case "wmts":
        var projectionExtent = projection.getExtent();
        var size = extent.getWidth(projectionExtent) / 256;
        var resolutions = new Array(20);
        var matrixIds = new Array(20);
        for (var z = 0; z < 20; ++z) {
          // generate resolutions and matrixIds arrays for this WMTS
          resolutions[z] = size / Math.pow(2, z);
          matrixIds[z] = z;
        }
        layer = new TileLayer({
          opacity: layerInfo.opacity ? layerInfo.opacity : 1,
          source: new WMTS({
            url: layerInfo.url,
            layer: layerInfo.layer ? layerInfo.layer : '0',
            matrixSet: layerInfo.matrixSet ? layerInfo.matrixSet : crs,
            format: layerInfo.format ? layerInfo.format : 'image/png',
            projection: projection,
            tileGrid: new WMTSTileGrid({
              origin: extent.getTopLeft(projectionExtent),
              resolutions: resolutions,
              matrixIds: matrixIds
            }),
            style: 'default',
            wrapX: true
          }),
          zIndex: layerInfo.zIndex,
        })
        break;
      case "wfs":
        var mapCRS = getProjection();
        var crs = layerInfo.crs ? layerInfo.crs : mapCRS
        var outputFormat = layerInfo.outputFormat || 'application/json'
        var version = layerInfo.version || '1.0.0'
        var vectorSource = new VectorSource({
          format: new GeoJSON(),
          url: function (extent) {
            if (!mapCRS) mapCRS = getProjection();
            // BOX 坐标转换
            if (crs != mapCRS) {
              console.log('wfs与地图坐标系不一致')
            }
            var url = layerInfo.url + '?service=WFS&' +
              'version=' + version + '&' +
              'request=GetFeature&' +
              'typename=' + layerInfo.layer + '&' +
              'outputFormat=' + outputFormat
            if (!layerInfo.noExtent) url += '&bbox=' + extent.join(',')
            if (!layerInfo.noCRS) url += '&srsname=' + crs
            return url;
          },
          strategy: bboxStrategy,
        });
        //初始化-渲染样式
        var styleFunction = function (feature, resolution) {
          var options = layerInfo
          if (options.map) {
            if (options.map.symbol) {
              var styleInfo = options.map.symbol;
              var textInfo = options.map.text;
              return getRender(feature, styleInfo, textInfo, resolution);
            } else {
              var textInfo = options.map.text;
              return getRender(feature, null, textInfo, resolution);
            }
          }
          else if (feature.getProperties()._symbol) {
            let symbolInfo = feature.getProperties()._symbol;
            let textInfo = feature.getProperties()._text;
            return getSymbol(symbolInfo, feature, textInfo, resolution);
          }
          else {
            return styles[feature.getGeometry().getType()];
          }
        }
        layer = new VectorLayer({
          source: vectorSource,
          style: styleFunction,
        });
        break;
      case "google":
      case "gaode":
      case "geoq":
      case "tdt":
      default:
        layer = new TileLayer({
          source: new XYZ({
            crossOrigin: crossOrigin,
            url: layerInfo.url,
            projection: projection
          }),
          zIndex: layerInfo.zIndex,
        });
        break;
    }
    if (!layerInfo.id) {
      layerInfo.id = layerInfo.layerId;
    }
    layer.set("id", layerInfo.id)
    return layer;
  }

  //设置图层可见性
  function setLayerVisible(targetlayer, visible) {
    let layerId;
    if ((typeof targetlayer) == "string")
      layerId = targetlayer;
    if ((typeof targetlayer) == "object")
      layerId = targetlayer.id;

    //以_结尾的清除所有前缀为id的图层
    if (layerId.substr(layerId.length - 1, 1) == "_") {
      for (let i = _this.layerlist.length - 1; i > 0; i--) {
        let layerPre = _this.layerlist[i];
        if (layerPre) {
          let id = layerPre.id ? layerPre.id : layerPre.get("id");
          if (id) {
            if (id.indexOf(layerId) > -1) {
              let div = document.getElementById(id);
              div.style.display = visible ? 'block' : 'none';
              //div.parentElement.remove();
            }
          }
        }
      }
      return;
    }

    this.layerlist.forEach(layer => {
      var targetId = layer.id ? layer.id : layer.get("id");
      if (targetId == layerId) { layer.setVisible(visible) }
    })
  }

  //显示气泡
  function showInfo(feature, popTitle, popContent) {
    if (Object.prototype.toString.call(feature) == '[object Array]') {
      var coordinate = feature;
    } else {
      var coordinate = extent.getCenter(feature.getGeometry().getExtent());
    }

    _this.popupDom.title.innerHTML = popTitle;
    _this.popupDom.content.innerHTML = popContent;
    _this.popupDom.container.style.display = 'block';

    coordinate = getCoordinates(coordinate)
    _this.popup.setPosition(coordinate);

    map.addOverlay(_this.popup);
  }

  //隐藏气泡矿
  function hideInfo() {
    if (this.popup) {
      this.popup.setPosition(undefined);
      this.popupDom.closer.blur();
    }

  }

  //显示提示框
  function showTooltip(feature, tooltipinfo) {
    let popTitle = tooltipinfo.title;
    var coordinate = extent.getCenter(feature.getGeometry().getExtent());
    if (view.getProjection().getCode() == 'EPSG:3857'){
      coordinate = proj.toLonLat(coordinate)
    }
    coordinate = getCoordinates(coordinate);
    let pixel = map.getPixelFromCoordinate(coordinate);
    let x0 = map.getViewport().getBoundingClientRect().left;
    let y0 = map.getViewport().getBoundingClientRect().top;
    _this.tooltip.style.display = 'block';
    // let x = e.originalEvent.clientX;
    // let y = e.originalEvent.clientY;
    let x = x0 + pixel[0];
    let y = y0 + pixel[1];
    _this.tooltip.style.left = x + 'px';
    _this.tooltip.style.top = y + 'px';
    _this.tooltip.innerHTML = popTitle;
    if (tooltipinfo.xoffset && tooltipinfo.yoffset) {
      _this.tooltip.style.transform = 'translate(' + tooltipinfo.xoffset + ',' + tooltipinfo.yoffset + ')';
    }
  }

  //隐藏提示框
  function hideTooltip() {
    _this.tooltip.style.display = 'none';
  }

  //地图事件绑定
  function addMapEvent(eventType, callback, eventId) {
    var event = map.on(eventType, function (e) {
      callback(e);
    })
    if (eventId) {
      event.id = eventId;
    }
    _this.mapEvents.push(event)
  }

  //地图事件解绑
  function removeMapEvent(eventId) {
    for (let i = 0; i < _this.mapEvents.length; i++) {
      const event = _this.mapEvents[i];
      if (event.id == eventId) {
        map.un(event.type, event.listener);
        _this.mapEvents.splice(i, 1);
        return;
      }
    }
  }

  //添加比例尺
  function addScale() {
    var scaleLineControl = new ScaleLine();
    scaleLineControl.setUnits("metric");
    map.addControl(scaleLineControl);
  }

  //添加鹰眼
  function addOverview(options) {
    // var div = document.createElement("div");
    // div.id = "ol-overview";
    // div.className = div.id;
    // document.getElementById("map").appendChild(div);
    var overviewMapControl = new OverviewMap();
    map.addControl(overviewMapControl);
  }

  //清除图层
  function layerClear(layerId) {
    //不传-清空所有图层
    if (!layerId) {
      for (let l = _this.layerlist.length - 1; l >= 0; l--) {
        let layer = _this.layerlist[l];
        let id = layer.id ? layer.id : layer.get("id");
        if (id) {
          if (ifclear(id)) {
            clear(layer, l, id);
          }
        } else {
          clear(layer, l, id);
        }
      }
      return;
    }
    //数组-批量删除
    else if (Object.prototype.toString.call(layerId).indexOf('Array') > -1) {
      layerId.forEach(id => {
        if (ifclear(id)) {
          singleClear(id);
        }
      })
    }
    //字符串-单个删除
    else if (typeof layerId == "string") {

      //以_结尾的清除所有前缀为id的图层
      if (layerId.substr(layerId.length - 1, 1) == "_") {
        for (let i = _this.layerlist.length - 1; i > 0; i--) {
          let layerPre = _this.layerlist[i];
          if (layerPre) {
            let id = layerPre.id ? layerPre.id : layerPre.get("id");
            if (id) {
              if (id.indexOf(layerId) > -1) {
                clear(layerPre, i, id);
                // let div = document.getElementById(id);
                // div.parentElement.remove();
              }
            }
          }
        }
      }

      //单个删除
      singleClear(layerId);
    }

    function singleClear(layerId) {
      _this.layerlist.forEach((layer, index) => {
        let id;
        if (layer.id) {
          id = layer.id;
          if (id == layerId) {
            layer.parentElement.removeChild(layer);
            _this.layerlist.splice(index, 1);
          }
          return;
        } else {
          id = layer.get("id");
        }
        if (id == layerId) {
          clear(layer, index, 1);
          return;
        }
      })
    }

    function clear(layer, index, layerId) {
      map.removeLayer(layer);
      layer = null;
      _this.layerlist.splice(index, 1);
      if (layerId) {
        let div = document.getElementById(layerId);
        if (div) {
          if (div.tagName == "CANVAS") div.remove();
          else div.parentElement.remove();
        }
      }
    }

    function ifclear(id) {
      let clear = true;
      for (let key in _this.basemaps) {
        let baselayer = _this.basemaps[key];
        let baselayerid = baselayer.id ? baselayer.id : baselayer.get("id");
        if (baselayerid == id) {
          clear = false;
          return clear;
        }
      }
      if (id.startsWith('base'))
        clear = false;
      return clear;
    }
  }

  //图层排序
  function layerOrder(layerId, zIndex) {
    for (let l = _this.layerlist.length - 1; l >= 0; l--) {
      let layer = _this.layerlist[l];
      let id = layer.id ? layer.id : layer.get("id");
      if (id == layerId) {
        layer.setZIndex(zIndex);
        return;
      }
    }
  }

  //缩放到指定范围或图层
  function flyTo(options) {
    var crs = view.getProjection().getCode();
    if (options.id) { //根据图层ID缩放
      var layer = getLayerById(options.id);
      if (layer) mapfit(layer, 1);
    } else if (options.center) { //根据中心点和级别缩放
      var center;
      if (crs.indexOf('4326') > -1) {
        center = options.center
      } else {
        center = proj.fromLonLat(options.center);
      }
      map.getView().animate({
        center: center,
        zoom: options.zoom,
        duration: options.duration ? options.duration : 1000,
      });
    } else {  //根据范围框缩放
      //坐标转换
      var min, max;
      if (crs.indexOf('4326') > -1) {
        min = options.extent.slice(0, 2);
        max = options.extent.slice(2, 4);
      } else {
        min = proj.fromLonLat(options.extent.slice(0, 2));
        max = proj.fromLonLat(options.extent.slice(2, 4));
      }
      map.getView().fit(min.concat(max), {
        duration: 1000,
      });
    }

  }

  //地图标绘
  function draw(type, callback) {
    var drawTool = new ldraw({
      type: type,
      map: map,
      callback: drawEnd,
    });
    drawTool.start();

    function drawEnd(result) {
      _this.layerlist.push(result.layer);
      if (callback) {
        var xys = [];
        var crs = view.getProjection().getCode()
        if (crs.indexOf('4326') > -1) {
          xys = result.coordinates
        } else {
          result.coordinates.forEach(crd => {
            xys.push(_this.toLonLat(crd));
          })
        }
        callback({
          coordinates: xys,
        });
      }
    }
  }

  //地图标绘启动
  function draw0(type, callback) {
    var _this = this;
    var source;
    if (!this.drawLayer) {
      var source = new VectorSource({ wrapX: false });
      this.drawLayer = new VectorLayer({
        source: source
      });
      map.addLayer(this.drawLayer);
    } else {
      source = this.drawLayer.getSource();
    }

    drawStop();
    var freehand = false;
    if (type.indexOf("Free") > -1) {
      freehand = true;
      type = type.replace("Free", "");
    }
    this.drawInteraction = new Draw({
      source: source,
      type: type,
      freehand: freehand
    });

    map.addInteraction(this.drawInteraction);


    this.drawInteraction.on("drawend", function (e) {
      let xys = [];
      if (type == 'Circle') {
        //圆形
        let center = e.feature.getGeometry().getCenter();
        var centerXY = proj.toLonLat(center);
        let radius = e.feature.getGeometry().getRadius();
        let radiusXY = radius / 111000;
        xys = createCircle1({
          center: centerXY,
          radius: radiusXY
        });
        xys.push(xys[0]);
      } else {

        let coords = e.feature.getGeometry().getCoordinates();
        let results;
        if (coords.length == 1) results = coords[0]
        else results = coords;
        results.forEach(coord => {
          var xy = proj.toLonLat(coord);
          xys.push(xy);
        })
      }

      if (callback) callback({
        event: e,
        coordinates: xys
      });
    }, this)
  }

  //生成圆形,半径为公里
  function createCircle(options) {
    var pointNum = options.pointNum ? options.pointNum : 360;
    var units = options.units ? options.units : 'kilometers';
    if (!options.units) { //不传单位则默认为度，将半径转为千米
      options.radius = options.radius * 111;
    }
    var option = {
      steps: pointNum,
      units: units,
      //properties: { foo: 'bar' }
    };
    var circle = turf.circle(options.center, options.radius, option);
    return circle.geometry.coordinates[0];
  }

  //生成圆形,半径为度数
  function createCircle1(options) {
    var centerXY = options.center;
    var radius = options.radius;
    let xys = [];
    for (let i = 0; i < 360; i++) {
      var x = centerXY[0] + radius * Math.sin(i * Math.PI / 180);
      var y = centerXY[1] + radius * Math.cos(i * Math.PI / 180);
      xys.push([x, y]);
    }
    return xys;
  }

  //函数的参数x,y为椭圆中心；a,b分别为椭圆横半轴
  function CreateEllipse(options) {
    var x = options.center[0],
      y = options.center[1],
      a = options.a,
      b = options.b;
    var pointNum = options.pointNum;

    var step = (a > b) ? 1 / a : 1 / b, points = [];
    step = 2 * Math.PI / pointNum;

    for (var i = 0; i < 2 * Math.PI; i += step) {
      var point = [x + a * Math.cos(i), y + b * Math.sin(i)];
      points.push(point);
    }
    points.push(points[0]);
    points = points.reverse();
    return points;
  }

  //画扇形
  function CreateSector(options) {
    var lon = options.center[0],
      lat = options.center[1],
      radius = options.radius,
      startAngle = options.startAngle,
      endAngle = options.endAngle,
      pointNum = options.pointNum;
    var sin;
    var cos;
    var x;
    var y;
    var angle;

    var points = new Array();
    points.push([lon, lat]);
    for (var i = 0; i <= pointNum; i++) {
      angle = startAngle + (endAngle - startAngle) * i / pointNum;
      sin = Math.sin(angle * Math.PI / 180);
      cos = Math.cos(angle * Math.PI / 180);
      x = lon + radius * sin;
      y = lat + radius * cos;
      points.push([x, y]);
    }
    points.push(points[0]);
    return points;
  }

  //画箭头
  function CreateArrow(options) {
    let origin = options.origin;
    let angle = options.angle;
    let distance = options.distance;
    let target = turf.destination(origin, distance, angle);
    var drawTool = new ldraw({
      type: "",
      map: map
    });
    var coordinates = drawTool.design.tailedsquadcombat([origin, target.geometry.coordinates]);
    return coordinates;
  }

  //生成缓冲区
  function createBuffer(options) {
    let feature;
    if (!options.gra) return;
    if (options.gra.features) {
      feature = options.gra.features[0];
    } else if (options.gra.geometry) {
      feature = options.gra
    }
    let radius = options.radius;
    let buffered = turf.buffer(feature, radius, { units: 'meters' });
    return buffered;
  }

  //地图标绘退出
  function drawStop() {
    if (_this.drawInteraction) {
      map.removeInteraction(_this.drawInteraction);
      _this.drawInteraction = null;
    }
  }

  //地图标绘内容清空
  function drawClear() {
    if (this.drawLayer) {
      map.removeLayer(_this.drawLayer);
      this.drawLayer = null;
    }
  }

  //缓冲
  function buffer(options) {
    var targetLayerId = options.targetLayerId;
    var targetLayer = getLayerById(targetLayerId);
    if (!targetLayer) return null;

    var datajson = options.data;
    var radius = options.radius;
    let buffered = turf.buffer(datajson, radius, { units: 'meters' });
    var features = targetLayer.getSource().getFeatures();
    var results = [];
    features.forEach((feature, index) => {
      //var pt = turf.point(feature.getGeometry());
      //var geo = feature.getGeometry().transform(proj.get('EPSG:3857'),proj.get('EPSG:4326'));
      //var coord = proj.toLonLat(feature.getGeometry().flatCoordinates);
	  var coord = getCoordinates(feature.getGeometry().flatCoordinates);
      let isin = turf.booleanPointInPolygon(coord, buffered);
      if (isin) {
        results.push(feature);
      }
    })
    var featuresJson = (new GeoJSON()).writeFeaturesObject(results, {
      featureProjection: view.getProjection().getCode(),
      dataProjection: proj.get('EPSG:4326')
    })

    return {
      buffered: buffered,
      results: featuresJson,
    }
  }

  //空间插值分析
  function interpolate(options) {
    if (options.type == 'vector') {
      return lidw(options);
    } else if (options.type == 'raster') {
      options.map = map;
      return lidwraster(options);
    }
  }

  //线段分段
  function lineChunk(options) {
    return llineChunk(options);
  }

  //线段分段渲染颜色
  function lineColorful(options) {
    var paths = options.paths;
    var length = options.length;
    var colorScale = options.colorScale;
    var lineWidth = options.lineWidth;
    var lines = [];

    for (let i = 0; i < paths.length - 1; i++) {
      const p1 = paths[i];
      const p2 = paths[i + 1];
      const v1 = p1[2];
      const v2 = p2[2];
      //分段
      let ps = llineChunk({
        paths: [p1, p2],
        length: length
      });
      //取出分段后的线，并计算颜色
      for (let j = 0; j < ps.length - 1; j++) {
        const lp1 = ps[j];
        const lp2 = ps[j + 1];
        //子段的值
        let value = v1 + ((j / ps.length) * (v2 - v1));
        //子段的颜色
        let color = getSubColor(value);
        let fs = {
          'type': 'Feature',
          'geometry': {
            'type': 'LineString',
            'coordinates': [lp1, lp2]
          },
          "properties": {
            '_symbol': {
              "color": color,
              "width": lineWidth,
              "type": "esriSLS",
              "style": "STYLE_NULL"
            }
          }
        }
        lines.push(fs);
      }
    }

    //整合数据
    let linedata = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:4326'
        }
      },
      'features': lines
    }
    return linedata;

    function getSubColor(value) {
      var preClr, preVal;
      for (let i = 0; i < colorScale.length; i++) {
        const scale = colorScale[i];
        var curVal = scale[0];
        var curClr = scale[1];
        if (scale[1].indexOf('#') > -1) {
          curClr = lcolor.colorToRgb(scale[1]);
        }

        if (value < scale[0]) {
          //计算颜色
          if (preClr) {
            var level = (value - preVal) / (curVal - preVal);
            var rc = curClr[0] - preClr[0];
            var gc = curClr[1] - preClr[1];
            var bc = curClr[2] - preClr[2];
            var r = preClr[0] + level * rc;
            var g = preClr[1] + level * gc;
            var b = preClr[2] + level * bc;
            return [r, g, b]
          } else {
            return curClr;
          }
        }
        //下一轮
        preVal = curVal;
        preClr = curClr;
      }
    }

  }

  //更新图层要素文字
  function updateFeatureText(options) {
    let layer = getLayerById(options.layerId);
    if (!layer) return;
    let features = layer.getSource().getFeatures();
    features.forEach(feature => {
      let curValue = feature.getProperties()[options.findField];
      if (curValue == options.findValue) {
        var obj = {};
        obj[options.updateField] = options.updateValue.toString()
        feature.setProperties(obj);
        if (!options.mulit) return;
      }
    })
  }

  //更新图层要素样式
  function updateFeatureSymbol(options) {
    let layer = getLayerById(options.layerId);
    if (!layer) return;
    let features = layer.getSource().getFeatures();
    features.forEach(feature => {
      let curValue = feature.getProperties()[options.findField];
      if (curValue == options.findValue) {
        var obj = {};
        obj[options.updateField] = options.updateValue.toString();
        feature.setProperties(obj);
        if (!options.mulit) return;
      }
    })
  }

  //渲染方法
  function getRender(feature, styleInfo, textInfo, resolution) {
    if (!styleInfo) {
      var symbol = getSymbol(null, feature, textInfo, resolution);
      return symbol;
    }
    switch (styleInfo.type) {
      case "simple":
        var symbol = getSymbol(styleInfo.symbol, feature, textInfo, resolution);
        return symbol;
        break;
      case "uniqueValue":
        var field = styleInfo.field1;
        var uniqueValueInfos = styleInfo.uniqueValueInfos;
        if (uniqueValueInfos) {
          for (let i = 0; i < uniqueValueInfos.length; i++) {
            const uniqueInfo = uniqueValueInfos[i];
            if (feature.getProperties()[field] == uniqueInfo.value) {
              return getSymbol(uniqueInfo.symbol, feature, textInfo, resolution);
            }
          }
        }
        return getSymbol(styleInfo.defaultSymbol, feature, textInfo, resolution);
        break;
      case "classBreaks":
        var field = styleInfo.field1;
        var classBreakInfos = styleInfo.classBreakInfos;
        var minValue = styleInfo.minValue;
        for (let i = 0; i < classBreakInfos.length; i++) {
          var classInfo = classBreakInfos[i];
          var maxValue = classInfo.classMaxValue;
          if (feature.getProperties()[field] > minValue && feature.getProperties()[field] <= maxValue) {
            return getSymbol(classInfo.symbol, feature, textInfo, resolution);
          }
        }
        return getSymbol(styleInfo.defaultSymbol, feature, textInfo, resolution);
        break;
      default:
        break;
    }
  }

  //生成样式
  function getSymbol(symbolInfo, feature, textInfo, resolution) {
    var symbol;
    if (!symbolInfo) {
      var symbol = styles[feature.getGeometry().getType()];
      symbol.text_ = getText(feature, textInfo, resolution);
      return symbol;
    }
    var symbolType = symbolInfo.type;
    switch (symbolType) {
      case "esriPMS"://图片图标
        symbol = new Style({
          image: new Icon({
            anchor: [
              symbolInfo.xoffset ? symbolInfo.xoffset : 0,
              symbolInfo.yoffset ? symbolInfo.yoffset : 0
            ],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            scale: symbolInfo.scale ? symbolInfo.scale : 1,
            src: symbolInfo.url,
            size: [symbolInfo.width, symbolInfo.height],
          }),
        })
        break;
      case "esriSMS":
        symbol = new Style({
          image: new CircleStyle({
            radius: symbolInfo.size ? symbolInfo.size : 5,
            fill: new Fill({
              color: getColor(symbolInfo.color)
            }),
            stroke: symbolInfo.outline ? new Stroke({
              color: getColor(symbolInfo.outline.color),
              width: symbolInfo.outline.width
            }) : null,
          })
        })
        break;
      case "esriSLS":
        symbol = new Style({
          stroke: new Stroke({
            color: getColor(symbolInfo.color),
            width: symbolInfo.width,
            lineDash: symbolInfo.lineDash,
          })
        })
        break;
      case "esriSFS":
        symbol = new Style({
          fill: new Fill({
            color: getColor(symbolInfo.color)
          }),
          stroke: symbolInfo.outline ? new Stroke({
            color: getColor(symbolInfo.outline.color),
            width: symbolInfo.outline.width,
            lineDash: symbolInfo.outline.lineDash,
          }) : undefined,
        })
        break;
      case "PointSymbol3D"://esri图片图标
        symbolInfo = symbolInfo.symbolLayers[0]
        symbol = new Style({
          image: new Icon({
            anchor: [
              symbolInfo.xoffset ? symbolInfo.xoffset : 0,
              symbolInfo.yoffset ? symbolInfo.yoffset : 0
            ],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            scale: symbolInfo.scale ? symbolInfo.scale : 1,
            src: symbolInfo.resource.href,
            size: [symbolInfo.size, symbolInfo.size],
          }),
        })
        break;
      default:
        break;
    }
    if (textInfo) {
      symbol.text_ = getText(feature, textInfo, resolution);
      return symbol;
    }

    function getText(feature, textInfo, resolution) {
      var newInfo;
      var defalutTextInfo = {
        xoffset: 0,
        yoffset: 0,
        fillColor: "red",
        outlineColor: "white",
        outlineWidth: 1,
        font: "normal 16px sans-serif",
        maxResolution: 0,
        placement: 'point',
        textBaseline: 'middle',
      }
      if (textInfo) {
        newInfo = Object.assign(defalutTextInfo, textInfo);
      }
      var properties = feature.getProperties();
      var value = feature.getProperties()[newInfo.field];
      if (newInfo.field in properties) {
        value = properties[newInfo.field];
      } else {
        console.log('error:要素的属性中不存在' + newInfo.field + '字段');
        return null;
      }
      if (resolution > newInfo.maxResolution && newInfo.maxResolution > 0) {
        value = '';
      }
      return new Text({
        text: value.toString(),
        offsetX: newInfo.xoffset,
        offsetY: newInfo.yoffset,
        fill: new Fill({ color: newInfo.fillColor }),
        stroke: new Stroke({ color: newInfo.outlineColor, width: newInfo.outlineWidth }),
        font: newInfo.font,
        placement: newInfo.placement,
        textBaseline: newInfo.textBaseline,
        backgroundFill: newInfo.backgroundFill ? new Fill({ color: newInfo.backgroundFill }) : undefined,
        padding: newInfo.padding
      })
    }

    return symbol;
  }

  //颜色处理
  function getColor(colorInfo) {
    if ((typeof colorInfo) == "object") {
      //二维数组为渐变色
      if ((typeof colorInfo[0]) == "object") {
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        var pixelRatio = DEVICE_PIXEL_RATIO;
        var grad = context.createLinearGradient(0, 0, 512 * pixelRatio, 0);
        colorInfo.forEach((color, index) => {
          if (index == colorInfo.length)
            grad.addColorStop(1, getColor(color));
          else
            grad.addColorStop(index / colorInfo.length, getColor(color));
        })
        return grad;
      }

      //一维数组直接转换
      if (colorInfo.length == 3) return "rgb(" + colorInfo.join(",") + ")";
      if (colorInfo.length == 4) return "rgba(" + colorInfo.join(",") + ")";
    } else if ((typeof colorInfo) == "string") {
      return colorInfo;
    }
  }

  //地图适应
  function mapfit(layer, zoom) {
    if (layer.type == 'TILE') {
      //let url = layer.getSource().getUrl();
    }
    else if (layer.type == 'IMAGE') {
      //let url = layer.getSource().getUrl();
    }
    else {
      var extent = layer.getSource().getExtent();
      if (zoom > 1) {
        let dx = (extent[2] - extent[0]) / 2;
        let dy = (extent[3] - extent[1]) / 2;
        if (dx == 0) dx = 1000;
        if (dy == 0) dy = 1000;
        extent[0] -= dx * (zoom - 1);
        extent[1] -= dy * (zoom - 1);
        extent[2] += dx * (zoom - 1);
        extent[3] += dy * (zoom - 1);
      }
      map.getView().fit(extent, {
        duration: 1000,
      });
    }
  }

  //地图导出-html2canvas
  function mapShot(options) {
    const opts = {
      useCORS: true,  // 允许加载跨域图片
      logging: true,
      imageTimeout: 1200,
    }
    //var mapdom = map.getViewport().children[0];
    var mapdom = document.getElementById(_this._MapConfig.container)
    html2canvas(mapdom, opts).then(function (canvas) {
      const _src = canvas.toDataURL()
      if (options) {
        if (options.type == 'download')
          saveImg(_src, canvas);
        if (options.callback) {
          options.callback(_src);
        }
      }
    })
  }

  //地图保存-toDataURL
  function mapShot1(options) {
    //var canvas = map.getViewport().children[0];
    var canvas = document.getElementsByClassName('ol-unselectable')[0];
    var image;
    try {
      image = canvas.toDataURL("image/png");
      if (options) {
        if (options.type = 'download')
          saveImg(image, canvas);
        return;
      }
      return image;
    } catch (error) {
      if (error.message.indexOf('exported') > -1) {
        console.log(error.message + '-->地图导出失败，存在跨域资源！');
      } else {
        console.log(error.message);
      }
    }
  }

  //保存image
  function saveImg1(imgUrl) {
    //创建下载a标签
    var a = document.createElement("a");
    a.setAttribute("id", "download");
    document.body.appendChild(a);
    //以下代码为下载此图片功能
    document.getElementById("download").href = imgUrl;
    document.getElementById("download").download = "img.png";
    var triggerDownload = document.getElementById("download");
    triggerDownload.click();
    //移除下载a标签
    document.body.removeChild(a);
  }

  //保存canvas
  function saveImg(imgUrl, canvas) {
    if (navigator.msSaveBlob) {
      navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
    } else {
      canvas.toBlob(function (blob) {
        saveAs(blob, 'map.png');
      });
    }
    return;
    //创建下载a标签
    var a = document.createElement("a");
    a.setAttribute("id", "download");
    document.body.appendChild(a);
    //以下代码为下载此图片功能
    document.getElementById("download").href = imgUrl;
    document.getElementById("download").download = "img.png";
    var triggerDownload = document.getElementById("download");
    triggerDownload.click();
    //移除下载a标签
    document.body.removeChild(a);
  }

  //转换坐标
  function fromLonLat(coordinate) {
    return proj.fromLonLat(coordinate, proj.get('EPSG:3857'));
  }

  //转换坐标
  function toLonLat(coordinate) {
    return proj.toLonLat(coordinate, proj.get('EPSG:3857'));
  }

  //获取以加载的图层
  function getLayerById(layerId) {
    for (let i = 0; i < _this.layerlist.length; i++) {
      let layer = _this.layerlist[i];
      if (layer.get("id") == layerId) {
        return layer;
      }
    }
    return null
  }

  //获取多点的长度
  function getLength(options) {
    var line = turf.lineString(options.gra);
    var length = turf.length(line, { units: options.units });
    return length;
  }

  //获取外接矩形
  function getExtent(options) {
    var gras = options.gra;
    let vectorSource;
    if (gras.type == 'FeatureCollection') {
      vectorSource = new VectorSource({
        features: (new GeoJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view ? view.getProjection().getCode() : 'EPSG:3857' // 设定当前地图使用的feature的坐标系
        })
      });
    } else if (gras.geometryType) {
      vectorSource = new VectorSource({
        features: (new EsriJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view ? view.getProjection().getCode() : 'EPSG:3857' // 设定当前地图使用的feature的坐标系
        })
      });
    }
    let extent = vectorSource.getExtent();
    let min = toLonLat([extent[0], extent[1]]);
    let max = toLonLat([extent[2], extent[3]]);
    return [...min, ...max];
  }


  String.prototype.colorRgb = function () {
    var sColor = this.toLowerCase();
    //十六进制颜色值的正则表达式
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    // 如果是16进制颜色
    if (sColor && reg.test(sColor)) {
      if (sColor.length === 4) {
        var sColorNew = "#";
        for (var i = 1; i < 4; i += 1) {
          sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
      }
      //处理六位的颜色值
      var sColorChange = [];
      for (var i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
      }
      // sColorChange.push(255);
      return sColorChange;
    }
    return sColor;



  };

  function segmentedColorScale(segments) {
    var points = [], interpolators = [], ranges = [];
    for (var i = 0; i < segments.length - 1; i++) {
      points.push(segments[i + 1][0]);
      interpolators.push(colorInterpolator(segments[i][1], segments[i + 1][1]));
      ranges.push([segments[i][0], segments[i + 1][0]]);
    }

    function colorInterpolator(start, end) {
      var r = start[0], g = start[1], b = start[2];
      var Δr = end[0] - r, Δg = end[1] - g, Δb = end[2] - b;
      return function (i, a) {
        return [Math.floor(r + i * Δr), Math.floor(g + i * Δg), Math.floor(b + i * Δb), a];
      };
    }

    function clamp(x, low, high) {
      return Math.max(low, Math.min(x, high));
    }

    function proportion(x, low, high) {
      return (clamp(x, low, high) - low) / (high - low);
    }

    return function (point, alpha) {
      var i;
      for (i = 0; i < points.length - 1; i++) {
        if (point <= points[i]) {
          break;
        }
      }
      var range = ranges[i];
      return interpolators[i](proportion(point, range[0], range[1]), alpha);
    };

  }

  //转换坐标汇总
  var coordtrsf = {
    xian80: "+proj=tmerc +lat_0=0 +lon_0=117 +k=1 +x_0=20500000 +y_0=0 +a=6378140 +b=6356755.288157528 +units=m +no_defs",
    wgs84: "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees",
    '4326': "+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees",
    '3857': "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs",
    '4019': '+proj=longlat +ellps=GRS80 +no_defs',
    run(sProj, tProj, sCoord) {
      var ssProj = this[sProj];
      var ttProj = this[tProj];
      var coord = proj4(ssProj, ttProj, sCoord);
      if (tProj == "4326" || tProj == "wgs84") {
        for (let i = 0; i < coord.length; i++) {
          if (coord[i] > 180)
            coord[i] = 180 - coord[i];
        }
      }
      return coord;
    }
  }
  this.coordtrsf = coordtrsf;

  //EsriJson转GeoJson
  function EsriJsonToGeoJson(esriJson) {
    let geoJson = jsonConverters.esriConverter().toGeoJson(esriJson);
    return geoJson
  }

  //GeoJson转EsriJson
  function GeoJsonToEsriJson(geoJson) {
    let esriJson = jsonConverters.geoJsonConverter().toEsri(geoJson);
    return esriJson
  }

  //判断点是否在面中
  function isInsidePolygon(x, y, rings) {
    try {
      var polygon = turf.polygon([rings]);
      let isin = turf.booleanPointInPolygon([x, y], polygon);
      return isin;
    } catch (error) {
      let poly = rings;
      let lng = x;
      let lat = y;
      for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i][0] <= lng && lng < poly[j][0]) || (poly[j][0] <= lng && lng < poly[i][0])) &&
          (lat < (poly[j][1] - poly[i][1]) * (lng - poly[i][0]) / (poly[j][0] - poly[i][0]) + poly[i][1]) &&
          (c = !c);
      return c;
    }
  }

  //查询地理编码-地名查经纬度
  function getGeoCode(options) {
    let keyWord = options.keyWord;
    let lon = options.lon;
    let lat = options.lat;
    let url = 'http://api.tianditu.gov.cn/geocoder?';
    let token = '&tk=619944c64ea5110052ab50df192eb202';
    if (keyWord) {
      url = url + 'ds={"keyWord":"' + keyWord + '"}' + token;
    } else if (lon && lat) {
      url = url + 'postStr={"lon":' + lon + ',"lat":' + lat + ',"ver":1}&type=geocode' + token;
    } else {
      return;
    }

    getUrl(url, function (result) {
      if (options.callback) {
        options.callback(result);
      }
    })
  }

  //查询兴趣点
  function getPOI(options) {
    let keyWord = options.keyWord;
    let queryType = options.queryType;
    let pointLonlat = options.pointLonlat;
    let queryRadius = options.queryRadius;
    let url = 'http://api.tianditu.gov.cn/search?postStr={'
      + '"keyWord":"' + keyWord + '",'
      + '"level":"15",'
      + '"mapBound":"73,3,135,54",'
      + '"queryType":"' + queryType + '",'
      + '"pointLonlat":"' + pointLonlat + '",'
      + '"queryRadius":"' + queryRadius + '",'
      + '"count":"1000","start":"0"'
      + '}&type=query&tk=619944c64ea5110052ab50df192eb202';
    getUrl(url, function (result) {
      if (options.callback) {
        options.callback(result);
      }
    })
  }

  //请求URL
  function getUrl(url, callback) {
    var request = new XMLHttpRequest();
    var timeout = false;
    var timer = setTimeout(function () {
      timeout = true;
      request.abort();
    }, 30 * 1000);
    request.open("GET", url);
    request.onreadystatechange = function () {
      if (request.readyState !== 4) return;
      if (timeout) return;
      clearTimeout(timer);
      if (request.status === 200) {
        callback(request.responseText);
      }
    }
    request.send(null);
  }

  //显示多边形的八方位标注
  function showDirectionLabel(options) {
    var gras = options.gra;
    let vectorSource;
    if (gras.type == 'FeatureCollection') {
      vectorSource = new VectorSource({
        features: (new GeoJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
        })
      });
    } else if (gras.geometryType) {
      vectorSource = new VectorSource({
        features: (new EsriJSON()).readFeatures(gras, {
          dataProjection: 'EPSG:4326',    // 设定JSON数据使用的坐标系
          featureProjection: view.getProjection().getCode() // 设定当前地图使用的feature的坐标系
        })
      });
    }
    //点数据
    var pointSource = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:4326'
        }
      },
      'features': []
    };
    //遍历图形，分别添加
    var features = vectorSource.getFeatures();
    features.forEach((feature, index) => {
      var geometry = feature.getGeometry();
      var fextent = geometry.getExtent();
      var coordinates = options.gra.features[index].geometry.coordinates;

      // var min = toLonLat([fextent[0], fextent[1]]);
      // var max = toLonLat([fextent[2], fextent[3]]);
	  var min = [fextent[0], fextent[1]];
	  min = getCoordinates(min);
	  var max =[fextent[2], fextent[3]];
	  max = getCoordinates(max);
      var distance = getLength({
        gra: [min, max],
        units: "kilometers",
      });

      //var center = toLonLat(extent.getCenter(fextent));
	  var center =extent.getCenter(fextent);
	  center = getCoordinates(center);
      //遍历方位
      options.directions.forEach(direction => {
        var pointTarget = turf.rhumbDestination(center, distance, direction.angle, { units: 'kilometers' });
        var line1 = turf.lineString([center, pointTarget.geometry.coordinates]);
        var polygon = options.gra.features[index];//turf.polygon(coordinates);
        //求相交点
        var corssFeatures = turf.lineIntersect(line1, polygon);
        var corssFeature = corssFeatures.features[0];
        corssFeature.properties = JSON.parse(JSON.stringify(direction));

        //计算图标及标注位置
        var symbol = JSON.parse(JSON.stringify(options.map.symbol));
        var text = JSON.parse(JSON.stringify(options.map.text));
        if (direction.angle == 0 || direction.angle == 180) {
          symbol.xoffset = 0;
          text.xoffset = 0;
        }
        else if (direction.angle < 180) {
          symbol.xoffset = symbol.xoffset;
          text.xoffset = text.xoffset;
        }
        else if (direction.angle > 180) {
          symbol.xoffset = 0 - symbol.xoffset;
          text.xoffset = 0 - text.xoffset;
        }
        if (direction.angle == 90 || direction.angle == 270) {
          symbol.yoffset = 0;
          text.yoffset = 0;
        }
        else if (direction.angle < 90 || direction.angle > 270) {
          symbol.yoffset = 0 - symbol.yoffset;
          text.yoffset = 0 - text.yoffset;
        }
        else if (direction.angle > 90 && direction.angle < 270) {
          symbol.yoffset = symbol.yoffset;
          text.yoffset = text.yoffset;
        }
        corssFeature.properties._text = text;
        corssFeature.properties._symbol = JSON.parse(JSON.stringify(options.map.symbol));
        if (direction.url) {
          corssFeature.properties._symbol.url = direction.url;
        }

        //计算属性
        var nameField = corssFeature.properties._text.field;
        var nameStr = corssFeature.properties[nameField];
        if (nameStr.indexOf('{') > -1) {
          var regex1 = /\((.+?)\)/g;   // () 小括号
          var regex2 = /\[(.+?)\]/g;   // [] 中括号
          var regex3 = /\{(.+?)\}/g;  // {} 花括号，大括号
          var valueFieldstr = nameStr.match(regex3)[0];
          var valueField = valueFieldstr.replace('{', '').replace('}', '');
          var value = feature.getProperties()[valueField];
          corssFeature.properties[nameField] = corssFeature.properties[nameField].replace(valueFieldstr, value);
        }

        pointSource.features.push(corssFeature);
      })
    })


    //加点
    addPoints({
      id: options.id,
      gra: pointSource,
      zoom: options.zoom,
    })
  }

  //高斯扩散模型
  function gaussAir(options) {
    return lgaussAir(options);
  }

  //计算图层边界
  function getLayerBorder(options) {
    var features = options.gra.features;
    var border = turf.union(...features);
    return {
      type: "FeatureCollection",
      features: [
        border
      ]
    }
  }

  //多边形合并
  function union(poly1, poly2) {
    return turf.union(poly1, poly2);
  }

  //两点距离
  function distance(crd1, crd2, options) {
    var from = turf.point(crd1);
    var to = turf.point(crd2);
    var pra = options ? options : { units: 'miles' };
    return turf.distance(from, to, pra);
  }



  /****************************************路径轨迹移动*******************************************/
  var routeStyles = {
    'route': new Style({
      stroke: new Stroke({
        width: 6, color: [237, 212, 0, 0.8]
      })
    }),
    'startMarker': new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: '#1ff71f' }),
        stroke: new Stroke({
          color: 'white', width: 2
        })
      })
    }),
    'endMarker': new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: 'red' }),
        stroke: new Stroke({
          color: 'white', width: 2
        })
      })
    }),
    'geoMarker': new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({ color: 'black' }),
        stroke: new Stroke({
          color: 'white', width: 2
        })
      })
    })
  };

  var animating = false;
  var MoveSpeed = 20;
  var moveStartTime;
  var vPathVectorLyr;
  var routeCoords = [];
  var routeLength = 0;
  var geoMarker = null;
  //线轨迹
  function PathAnimation(pathCoords) {
    //var strPathCoords=[117.08078384399414,29.062621941711182,117.1559715270996,29.056319759397912,117.31819152832031,29.149462744084232,117.23991394042969,28.98006287631301,117.3068618774414,29.028855756236318];
    //var strPathCoords= pathCoords.toString();
    //var vPolyline=strPathCoords.join('');
    //var vPolyline=strPathCoords.join('');
    // var route = (new Polyline({
    //   factor: 1e6
    // }).readGeometry(vPolyline, {
    //   dataProjection: 'EPSG:4326',
    //   featureProjection: 'EPSG:3857'
    // }));

    var route = new LineString(pathCoords);

    routeCoords = null;
    //routeCoords = route.getCoordinates();
    routeCoords = pathCoords;
    routeLength = routeCoords.length;



    var routeFeature = new Feature({
      type: 'route',
      geometry: route
    });
    geoMarker = (new Feature({
      type: 'geoMarker',
      geometry: new Point(routeCoords[0])
    }));

    var startMarker = new Feature({
      type: 'startMarker',
      geometry: new Point(routeCoords[0])
    });
    var endMarker = new Feature({
      type: 'endMarker',
      geometry: new Point(routeCoords[routeLength - 1])
    });
    vPathVectorLyr = new VectorLayer({
      source: new VectorSource({
        features: [routeFeature, geoMarker, startMarker, endMarker]
      }),
      style: function (feature) {
        // hide geoMarker if animation is active
        if (animating && feature.get('type') === 'geoMarker') {
          return null;
        }
        return routeStyles[feature.get('type')];
      }
    });
    map.addLayer(vPathVectorLyr);
    // setTimeout(function(){
    // 	startAnimation();
    // },1000);

  }

  /****************************************路径轨迹移动*******************************************/

  /****************************************I查询*******************************************/
  var iSelect = null;
  var iModify = null;
  function iSelectFeature(isSelectFeature) {
    if (isSelectFeature) { //开启选择要素功能
      //singleclick 选择要素
      iSelect = new Select();

      //click 选择要素
      // var iSelect = new Select({
      //   condition: click
      // });

      //pointermove 选择要素
      //  Iselect = new Select({
      //   condition: pointerMove
      // });

      iSelect.on('select', function (evt) {
        var selecte = evt.selected;
        if (selecte.length > 0) {
          //var vtitle=	selecte[0].values_["name"];
          console.log(selecte[0].values_);

        }
      });

      iModify = new Modify({
        features: iSelect.getFeatures()
      });
      map.addInteraction(iSelect);
      map.addInteraction(iModify);

    }
    else {
      if (iSelect != null) {
        map.removeInteraction(iSelect);
      }
      if (iModify != null) {
        map.removeInteraction(iModify);
      }

    }
  }
  /****************************************I查询*******************************************/

  function getProjection() {
    return view ? view.getProjection().getCode() : null
  }

  function getCoordinates(coord) {
    var mapCRS = getProjection()
    if (mapCRS == 'EPSG:4326') return coord;
    else return fromLonLat(coord)
  }

}

export default lgis
