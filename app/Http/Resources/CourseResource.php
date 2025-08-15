<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'image_src' => $this->image_src,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'units' => UnitResource::collection($this->whenLoaded('units')),
        ];
    }
}
