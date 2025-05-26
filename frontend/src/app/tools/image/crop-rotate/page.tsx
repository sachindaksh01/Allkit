"use client";

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Upload, RotateCw, Download, Crop as CropIcon, Trash2, RotateCcw } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

function getCroppedImg(
  imageSrc: string,
  crop: { x: number; y: number; width: number; height: number },
  rotation: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('No canvas context');

      // Calculate the safe area size
      const safeArea = Math.max(image.width, image.height) * 2;
      canvas.width = safeArea;
      canvas.height = safeArea;

      // Draw the rotated image
      ctx.translate(safeArea / 2, safeArea / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-safeArea / 2, -safeArea / 2);
      ctx.drawImage(
        image,
        (safeArea - image.width) / 2,
        (safeArea - image.height) / 2
      );

      // Get the cropped image data
      const data = ctx.getImageData(0, 0, safeArea, safeArea);

      // Set the canvas size to the desired crop size
      canvas.width = crop.width;
      canvas.height = crop.height;

      // Draw the cropped image
      ctx.putImageData(
        data,
        Math.round(-safeArea / 2 + image.width / 2 - crop.x),
        Math.round(-safeArea / 2 + image.height / 2 - crop.y)
      );

      // Convert to base64
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject('Failed to load image');
  });
}

export default function ImageCropRotatePage() {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
    maxFiles: 1
  });

  const onCropComplete = useCallback((_: any, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    if (!image || !croppedAreaPixels) return;
    try {
      const cropped = await getCroppedImg(image, croppedAreaPixels, rotation);
      setCroppedImage(cropped);
      toast.success("Image cropped successfully!");
    } catch (e) {
      toast.error("Failed to crop image");
    }
  }, [image, croppedAreaPixels, rotation]);

  const handleDownload = () => {
    if (!croppedImage) return;
    const link = document.createElement("a");
    link.href = croppedImage;
    link.download = "cropped-image.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const clearAll = () => {
    setImage(null);
    setCroppedImage(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
  };

  const handleRotate45 = () => {
    setRotation((prev) => (prev + 45) % 360);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Image Crop & Rotate</h1>
        {!image && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
          >
            <input {...getInputProps()} />
            <div className="space-y-4">
              <div className="text-6xl mb-4">📐</div>
              <p className="text-lg">
                {isDragActive ? 'Drop the image here...' : 'Drag & drop image here, or click to select'}
              </p>
              <p className="text-sm text-gray-500">Supports PNG, JPG, JPEG, WEBP</p>
            </div>
          </div>
        )}
        {image && !croppedImage && (
          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="relative w-full h-[400px] bg-neutral-800 rounded-lg overflow-hidden">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                cropShape="rect"
                showGrid={true}
                objectFit="contain"
                restrictPosition={false}
                minZoom={0.5}
                maxZoom={3}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-4 w-full justify-center items-center">
              <div className="flex flex-col items-center w-full md:w-1/3">
                <label className="text-xs mb-1">Zoom</label>
                <Slider value={[zoom]} min={1} max={3} step={0.01} onValueChange={([v]) => setZoom(v)} />
              </div>
              <div className="flex flex-col items-center w-full md:w-2/3">
                <label className="text-xs mb-1">Rotation</label>
                <div className="flex items-center gap-4 w-full">
                  <Button variant="outline" size="icon" onClick={handleRotate45} className="h-10 w-10">
                    <RotateCw size={20} />
                  </Button>
                  <div className="flex-1">
                    <Slider 
                      value={[rotation]} 
                      min={0} 
                      max={360} 
                      step={1} 
                      onValueChange={([v]) => setRotation(v)}
                      className="h-10"
                    />
                  </div>
                  <span className="text-sm w-16 text-center font-medium">{rotation}°</span>
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <Button onClick={showCroppedImage} className="flex items-center gap-2"><CropIcon size={18}/>Crop & Rotate</Button>
              <Button variant="secondary" onClick={clearAll} className="flex items-center gap-2"><Trash2 size={18}/>Clear</Button>
            </div>
          </div>
        )}
        {croppedImage && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <img src={croppedImage} alt="Cropped Preview" className="rounded-lg max-w-full max-h-96 border" />
            <div className="flex gap-4">
              <Button onClick={handleDownload} className="flex items-center gap-2"><Download size={18}/>Download</Button>
              <Button variant="secondary" onClick={clearAll} className="flex items-center gap-2"><Trash2 size={18}/>Crop Another</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 