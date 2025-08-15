<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChallengeOptionResource extends JsonResource
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
            'challenge_id' => $this->challenge_id,
            'text' => $this->text,
            'correct' => $this->correct,
            'audio_src' => $this->audio_src,
            'image_src' => $this->image_src,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
