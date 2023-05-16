import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError,retry } from "rxjs/operators";
import { UnionAvatarsRequest, UnionAvatarsResponse } from "src/app/models/payloads";
import { environment } from "src/environments/environment";


@Injectable({
  providedIn: 'root'
})
export class UnionAvatarsService {
    private headers = { headers : {"Authorization" : "Bearer " +environment.token}}
    constructor(private readonly http : HttpClient){
      
    }

    getAvatar(image:string, body_id: string){
      const req:UnionAvatarsRequest = {
        name: "Union Avatars Test request",
        output_format: "glb",
        style: "phr",
        img: image,
        body_id : body_id,
        create_thumbnail: false,
        optimize: false
      }
      return this.http.post<UnionAvatarsResponse>(environment.url + "/avatars", req, this.headers);
    }

    getBodies(){
      return this.http.get(environment.url + "/bodies", this.headers);
    }
}