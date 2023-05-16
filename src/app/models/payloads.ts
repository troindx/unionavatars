export interface UnionAvatarsResponse{
        name: string,
        output_format: string,
        style: string,
        id:  string,
        avatar_link: string,
        created_at: Date,
        thumbnail_url: string,
        body_id?: string,
        head_id?: string
}

export interface UnionAvatarsRequest{
        name: string,
        output_format: string,
        style: string,
        body_id :string,
        img: string,
        create_thumbnail: boolean,
        optimize: boolean
}

export interface UnionAvatarsBody {
        created_at: Date,
        id : string,
        name : string,
        source_type: string,
        style: string,
        thumbnail_url: string,
        url: string
}