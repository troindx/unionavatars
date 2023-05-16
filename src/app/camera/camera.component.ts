import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, Photo } from '@capacitor/camera';
import { Toast } from '@capacitor/toast';
import { TranslateService } from '@ngx-translate/core';
import { UnionAvatarsService } from '../services/unionavatars/unionavatars.service';
import { UnionAvatarsBody } from '../models/payloads';

@Component({
  selector: 'app-camera',
  templateUrl: './camera.component.html',
  styleUrls: ['./camera.component.scss'],
})
export class CameraComponent  implements OnInit {
  photo : Photo | undefined;
  filteredImage : string = "";
  avatar : string | undefined = undefined;
  bodies : UnionAvatarsBody[] = [];
  constructor( private translate : TranslateService, private uaService : UnionAvatarsService) { 
    this.photo = undefined;

  }

  async ngOnInit() {
    console.log("camera component initialized");
    this.uaService.getBodies().subscribe({next : bodies => {
      this.bodies = (bodies as UnionAvatarsBody[])
      Toast.show({ text: this.translate.instant("BODIES_LOADED")});
      console.log(this.bodies);
    }, error: error => {
      console.error (error);
      Toast.show({text:error});
    }});
  }

  getRandomBodyId(){
    const index = Math.floor(Math.random() * (this.bodies.length + 1))
    console.log(index);
    return this.bodies[index].id;
  }

  async applyBorderAndLineFilterToImage(base64Image: string): Promise<string> {
    // Create an image object from the base64-encoded image
    const image = new Image();
    image.src = base64Image;
  
    // Wait for the image to load
    await new Promise((resolve) => {
      image.onload = resolve;
    });
  
    // Create a canvas to draw the image onto
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw Error("Canvas could not be created");
    ctx.drawImage(image, 0, 0);
  
    // Get the image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
  
    // Convert the image to grayscale
    for (let i = 0; i < data.length; i += 4) {
      const brightness = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
      data[i] = brightness;
      data[i + 1] = brightness;
      data[i + 2] = brightness;
    }
  
    // Apply edge detection
    const kernel = [
      [-1, -1, -1],
      [-1, 8, -1],
      [-1, -1, -1],
    ];
    const edgeData = this.applyConvolution(kernel, imageData);
  
    // Find lines in image
    const redThreshold = 128;
    const blueThreshold = 64;
    for (let i = 0; i < data.length; i += 4) {
      const red = edgeData[i];
      if (red > redThreshold) {
        data[i] = 255; // Red for borders
        data[i + 3] = 255;
      } else if (red > blueThreshold) {
        data[i] = 0; // Blue for lines
        data[i + 1] = 0;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }
  
    // Put the modified image data back onto the canvas
    ctx.putImageData(imageData, 0, 0);
  
    // Get the base64-encoded image from the canvas
    const base64EncodedImage = canvas.toDataURL();
  
    // Return the base64-encoded image
    return base64EncodedImage;
  }
  
  applyConvolution(kernel: number[][], imageData: ImageData): Uint8ClampedArray {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const outputData = new Uint8ClampedArray(data.length);
  
    // Loop through each pixel in the image
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Apply the convolution kernel to the pixel and its neighbors
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        for (let ky = 0; ky < kernel.length; ky++) {
          for (let kx = 0; kx < kernel[ky].length; kx++) {
            const cx = x + kx - 1;
            const cy = y + ky - 1;
            if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
              const i = (cy * width + cx) * 4;
              r += data[i] * kernel[ky][kx];
              g += data[i + 1] * kernel[ky][kx];
              b += data[i + 2] * kernel[ky][kx];
              a += data[i + 3] * kernel[ky][kx];
            }
          }
        }
      
        // Update the output data array with the new pixel value
        const i = (y * width + x) * 4;
        outputData[i] = r;
        outputData[i + 1] = g;
        outputData[i + 2] = b;
        outputData[i + 3] = a;
      }
    }
  return outputData;
  }
  
  async takePicture() : Promise<void>{
    try {
      this.avatar = undefined;
      this.photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl
      });
      
      if (this.photo.dataUrl){
        let base_image = new Image();
        base_image.src = this.photo.dataUrl;
        this.filteredImage = await this.applyBorderAndLineFilterToImage(this.photo.dataUrl);  
        this.uaService.getAvatar(this.photo.dataUrl, this.bodies[1].id).subscribe( {next: response => {
          console.log(response);
          this.avatar = response.avatar_link;
          this.photo = undefined;
          Toast.show({ text: this.translate.instant("AVATAR_RECEIVED")});
        }, error : error => {
          console.error (error);
          Toast.show({text: error});
        }});
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error ){
        console.error(error.name + " ::: " + error.message);
        Toast.show({text:error.message})
      }
    }
  }

}
