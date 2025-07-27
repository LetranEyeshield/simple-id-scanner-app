"use client";
import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import Tesseract from "tesseract.js";

export default function IDScanner() {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setImage(imageSrc);
      runOCR(imageSrc);
    }
  };

  const runOCR = async (img: string) => {
    setLoading(true);
    setText("");

    try {
      const result = await Tesseract.recognize(img, "eng", {
        logger: (m) => console.log(m),
      });
      setText(result.data.text);
    } catch (err) {
      console.error("OCR Error:", err);
    } finally {
      setLoading(false);
    }
  };

  //   const runOCR = async (img: string) => {
  //     setLoading(true);
  //     setText("");
  //     try {
  //       const result = await Tesseract.recognize(img, "eng", {
  //         logger: (m) => console.log(m),
  //       });

  //       const confidence = result.data.confidence;
  //       console.log("Confidence:", confidence);

  //       if (confidence < 60) {
  //         setText("⚠️ Image is blurry or unreadable. Please try again.");
  //       } else {
  //         setText(result.data.text);
  //       }
  //     } catch (err) {
  //       console.error("OCR Error:", err);
  //       setText("❌ Failed to process image.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {!image && (
        <>
          {/* <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-md border"
          /> */}
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 425,
              height: 300,
              facingMode: "environment", // mobile rear cam
            }}
            className="rounded-md border"
          />

          <button
            onClick={capture}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Capture ID
          </button>
        </>
      )}

      {image && (
        <div className="flex flex-col items-center">
          <img src={image} alt="Captured ID" className="w-[300px] rounded-md" />
          <button
            onClick={() => {
              setImage(null);
              setText("");
            }}
            className="mt-2 bg-gray-600 text-white px-3 py-1 rounded"
          >
            Retake
          </button>
        </div>
      )}

      {loading && <p>🧠 Scanning ID... Please wait.</p>}
      {text && (
        <div className="mt-4 w-full max-w-lg">
          <h2 className="text-lg font-semibold">📝 Extracted Text:</h2>
          <pre className="bg-gray-100 p-2 rounded whitespace-pre-wrap">
            {text}
          </pre>
        </div>
      )}
    </div>
  );
}
