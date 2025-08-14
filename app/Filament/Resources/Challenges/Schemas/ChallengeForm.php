<?php

namespace App\Filament\Resources\Challenges\Schemas;

use App\Models\Lesson;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ChallengeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('lesson_id')
                    ->label('Lesson')
                    ->options(Lesson::pluck('title', 'id'))
                    ->searchable()
                    ->required(),
                Select::make('type')
                    ->options([
                        'select' => 'Select',
                        'match' => 'Match',
                        'fill-blank' => 'Fill in the blank',
                        'listen' => 'Listen',
                        'speak' => 'Speak',
                        'arrange' => 'Arrange',
                    ])
                    ->required(),
                Textarea::make('question')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('order')
                    ->required()
                    ->numeric()
                    ->default(1),
                TextInput::make('audio_src'),
                FileUpload::make('image_src')
                    ->image()
                    ->directory('challenges'),
            ]);
    }
}
