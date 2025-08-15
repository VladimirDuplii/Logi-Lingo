<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChallengeResource extends JsonResource
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
            'lesson_id' => $this->lesson_id,
            'type' => $this->type,
            'question' => $this->question,
            'order' => $this->order,
            'audio_src' => $this->audio_src,
            'image_src' => $this->image_src,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'options' => ChallengeOptionResource::collection($this->whenLoaded('options')),
            'challenge_progress' => ChallengeProgressResource::collection($this->whenLoaded('challengeProgress')),
        ];
    }
}
