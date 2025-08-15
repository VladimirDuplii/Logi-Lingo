<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProgressResource extends JsonResource
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
            'user_id' => $this->user_id,
            'active_course_id' => $this->active_course_id,
            'user_name' => $this->user_name,
            'user_image_src' => $this->user_image_src,
            'hearts' => $this->hearts,
            'points' => $this->points,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'active_course' => $this->whenLoaded('activeCourse', function () {
                return new CourseResource($this->activeCourse);
            }),
        ];
    }
}
