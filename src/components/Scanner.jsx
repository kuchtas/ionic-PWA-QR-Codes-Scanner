import { IonButton } from "@ionic/react";
import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

const Scanner = () => {
  const [scanActive, setScanActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [request, setRequest] = useState(null);
  const videoTag = useRef();

  const video = document.getElementById("scanner-preview");
  const canvas = document.getElementById("scanner-canvas");

  const startScanning = async () => {
    setScanActive(true);
    setScanResult(null);
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((stream) => (videoTag.current.srcObject = stream))
      .catch(console.log);
    setRequest(requestAnimationFrame(scan));
  };

  const stopScanning = () => {
    setScanActive(false);
    cancelAnimationFrame(request);
  };

  const scan = () => {
    console.log("scanning");
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const cavasContext = canvas.getContext("2d");
      cavasContext.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = cavasContext.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        setScanResult(code);
        setScanActive(false);
      } else {
        if (scanActive || code === null) {
          setRequest(requestAnimationFrame(scan));
        }
      }
    } else {
      setRequest(requestAnimationFrame(scan));
    }
  };

  useEffect(() => {
    console.log(scanResult);
  }, [scanResult]);

  return (
    <>
      <div style={{ textAlign: "center" }}>
        <IonButton onClick={scanActive ? stopScanning : startScanning}>
          {scanActive ? "Stop scanning" : "Start scanning"}
        </IonButton>
      </div>
      <div>
        <video
          id="scanner-preview"
          width="100%"
          height="600px"
          hidden={!scanActive}
          ref={videoTag}
          autoPlay
          playsInline={true}
        />
        <canvas id="scanner-canvas" hidden></canvas>
      </div>
      <div id="result" style={{ textAlign: "center", marginTop: "100px" }}>
        {scanResult?.data}
      </div>
    </>
  );
};

export default Scanner;
