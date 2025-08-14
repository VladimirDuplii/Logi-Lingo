<?php

namespace App\Filament\Resources\ChallengeOptions\Schemas;

use App\Models\Challenge;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ChallengeOptionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('challenge_id')
                    ->label('Challenge')
                    ->options(Challenge::pluck('question', 'id'))
                    ->searchable()
                    ->required(),
                Textarea::make('text')
                    ->required()
                    ->columnSpanFull(),
                Toggle::make('is_correct')
                    ->required(),
                TextInput::make('audio_src'),
                FileUpload::make('image_src')
                    ->image()
                    ->directory('challenge-options'),
            ]);
    }
}
