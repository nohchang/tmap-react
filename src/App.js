import "./App.css";
import React, { useEffect, useState } from "react";
import $ from "jquery";
import useCurrentLocation from "./hooks/useCurrentLocation";
import useWatchLocation from "./hooks/useWatchLocation";
import { geolocationOptions } from "./constants/geolocationOptions";
import Location from "./components/Location";
const { Tmapv2 } = window;

const App = () => {
  //현재좌표
  const { location: currentLocation, error: currentError } = useCurrentLocation(geolocationOptions);
  const { location, cancelLocationWatch, error } = useWatchLocation(geolocationOptions);
  const [isWatchinForLocation, setIsWatchForLocation] = useState(true);

  useEffect(() => {
    if (!location) return;

    // Cancel location watch after 3sec
    setTimeout(() => {
      cancelLocationWatch();
      setIsWatchForLocation(false);
    }, 3000);
  }, [location, cancelLocationWatch]);

    // console.log(location.latitude)
  //   console.log(location.longitude)
  
  //TMAP
  var map, marker;
  var markerArr = [], labelArr = [];
    
  function initTmap() {
      // 1. 지도 띄우기
      map = new Tmapv2.Map("map_div", {
          center : new Tmapv2.LatLng(37.570028, 126.986072),
          width : "70%",
          height : "400px",
          zoom : 15,
          zoomControl : true,
          scrollwheel : true
      });
      
      // 2. POI 통합 검색 API 요청
      $("#btn_select").click(function(){
          var searchKeyword = $('#searchKeyword').val();
          $.ajax({
              method:"GET", // 요청 방식
              url:"https://apis.openapi.sk.com/tmap/pois/search/around?version=1&format=json&callback=result", // url 주소
              data:{
                  "categories" : searchKeyword,
                  "resCoordType" : "EPSG3857",
                  "searchType" : "name",
                  "searchtypCd" : "A",
                  "radius" : 1,
                  "reqCoordType" : "WGS84GEO",
                  "centerLon" : "126.97840230814947",
                  "centerLat" : "37.566686604063214",
                  "appKey" : "l7xx61e1fae75a0743fb958aa2ed88371f22",
                  "count" : 10
              },
              success:function(response){
                  console.log(response);
                  
                  var resultpoisData = response.searchPoiInfo.pois.poi;
                  
                  // 2. 기존 마커, 팝업 제거
                  if(markerArr.length > 0){
                      for(var i in markerArr){
                          markerArr[i].setMap(null);
                      }
                      markerArr = [];
                  }

                  if(labelArr.length > 0){
                      for(var i in labelArr){
                          labelArr[i].setMap(null);
                      }
                      labelArr = [];
                  }
                  
                  var innerHtml = ""; // Search Reulsts 결과값 노출 위한 변수
                  var positionBounds = new Tmapv2.LatLngBounds(); //맵에 결과물 확인 하기 위한 LatLngBounds객체 생성
                  
                  // 3. POI 마커 표시
                  for(var k in resultpoisData){
                      // POI 마커 정보 저장
                      var noorLat = Number(resultpoisData[k].noorLat);
                      var noorLon = Number(resultpoisData[k].noorLon);
                      var name = resultpoisData[k].name;
                      
                      // POI 정보의 ID
                      var id = resultpoisData[k].id;
                      
                      // 좌표 객체 생성
                      var pointCng = new Tmapv2.Point(noorLon, noorLat);
                      
                      // EPSG3857좌표계를 WGS84GEO좌표계로 변환
                      var projectionCng = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(pointCng);
                      
                      var lat = projectionCng._lat;
                      var lon = projectionCng._lng;
                      
                      // 좌표 설정
                      var markerPosition = new Tmapv2.LatLng(lat, lon);
                      
                      // Marker 설정
                      marker = new Tmapv2.Marker({
                          position : markerPosition,
                          //icon : "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_a.png",
                          icon : "http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_" + k + ".png",
                          iconSize : new Tmapv2.Size(24, 38),
                          title : name,
                          map:map
                      });
                      // 결과창에 나타날 검색 결과 html
                      innerHtml += "<li><div><img src='http://tmapapi.sktelecom.com/upload/tmap/marker/pin_b_m_" 
                      + k + ".png' style='vertical-align:middle;'/><span>"+name+"</span>  "
                      +"<button type='button' name='sendBtn' onClick='poiDetail("+id+");'>상세보기</button></div></li>";
                      
                      // 마커들을 담을 배열에 마커 저장
                      markerArr.push(marker);
                      positionBounds.extend(markerPosition);	// LatLngBounds의 객체 확장
                  }
                  
                  $("#searchResult").html(innerHtml);	//searchResult 결과값 노출
                  map.panToBounds(positionBounds);	// 확장된 bounds의 중심으로 이동시키기
                  map.zoomOut();
              },
              error:function(request,status,error){
                  console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
              }
          });
      });
  }

  // 4. POI 상세 정보 API
  function poiDetail(poiId){
      $.ajax({
          method:"GET",
          url:"	https://apis.openapi.sk.com/tmap/pois/"+poiId+"?version=1&resCoordType=EPSG3857&format=json&callback=result&appKey="+"l7xx61e1fae75a0743fb958aa2ed88371f22",
          async:false,
          success:function(response){
              var detailInfo = response.poiDetailInfo;
              var name = detailInfo.name;
              var address = detailInfo.address;
              
              var noorLat = Number(detailInfo.frontLat);
              var noorLon = Number(detailInfo.frontLon);
              
              var pointCng = new Tmapv2.Point(noorLon, noorLat);
              var projectionCng = new Tmapv2.Projection.convertEPSG3857ToWGS84GEO(pointCng);
              
              var lat = projectionCng._lat;
              var lon = projectionCng._lng;
              
              var labelPosition = new Tmapv2.LatLng(lat, lon);
              
              var content = "<div style=' border-radius:10px 10px 10px 10px;background-color:#2f4f4f; position: relative;"
                      + "line-height: 15px; padding: 5 5px 2px 4; right:65px;'>"
                      + "<div style='font-size: 11px; font-weight: bold ; line-height: 15px; color : white'>"
                      + "name : "
                      + name
                      + "</br>"
                      + "address : "
                      + address + "</div>" + "</div>";
              
              var labelInfo = new Tmapv2.Label({
                  position : labelPosition,
                  content : content,
                  map:map
              });//popup 생성
              
              labelArr.push(labelInfo);
              
          },
          error:function(request,status,error){
              console.log("code:"+request.status+"\n"+"message:"+request.responseText+"\n"+"error:"+error);
          }
      });
  }

  useEffect(() => {
    initTmap();
  }, []);

  return (
    <>
  <div>
          <input type="text" class="text_custom" id="searchKeyword" name="searchKeyword" value="화장실" />	
          <button id="btn_select">적용하기</button>
    </div>
    <div>
          <div style={{width: "30%", float: "left"}}>
              <div class="title"><strong>Search</strong> Results</div>
              <div class="rst_wrap">
                  <div class="rst mCustomScrollbar">
                      <ul id="searchResult" name="searchResult">
                          <li>검색결과</li>
                      </ul>
                  </div>
              </div>
          </div>
          <div id="map_div" class="map_wrap" style={{float: "left"}}></div>
    </div>
    </>
  );
};

  export default App;
  