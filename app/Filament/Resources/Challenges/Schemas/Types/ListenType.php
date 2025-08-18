<?php

namespace App\Filament\Resources\Challenges\Schemas\Types;

use Filament\Schemas\Components\Fieldset;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;

class ListenType
{
    public static function getFieldset(): Fieldset
    {
        return Fieldset::make('Listen Challenge Content')
            ->schema([
                FileUpload::make('content.audio_file')
                    ->label('Challenge Audio File')
                    ->disk('public')
                    ->directory('challenges/audio')
                    ->acceptedFileTypes(['audio/mpeg', 'audio/wav', 'audio/mp3'])
                    ->maxSize(5120) // 5MB
                    ->helperText('Upload an audio file for the listening challenge')
                    ->required(),
                TextInput::make('content.correct_answer')
                    ->label('Correct Answer')
                    ->placeholder('What should the student type after listening?')
                    ->required()
                    ->maxLength(255),
                Textarea::make('content.instructions')
                    ->label('Instructions')
                    ->placeholder('e.g., "Listen and type what you hear"')
                    ->rows(2)
                    ->maxLength(500),
            ])
            ->visible(fn ($get) => $get('type') === 'listen');
    }
}