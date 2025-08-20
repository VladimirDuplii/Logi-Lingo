<?php

namespace App\Filament\Resources\Challenges\Schemas;

use App\Models\Challenge;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Unit;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Repeater;
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
                    ->options(function () {
                        return Lesson::with('unit.course')
                            ->get()
                            ->mapWithKeys(function ($lesson) {
                                $courseTitle = $lesson->unit->course->title ?? 'No Course';
                                $unitTitle = $lesson->unit->title ?? 'No Unit';
                                $label = "{$courseTitle} > {$unitTitle} > {$lesson->title}";
                                return [$lesson->id => $label];
                            });
                    })
                    ->searchable()
                    ->required()
                    ->live(),
                    
                Select::make('type')
                    ->options([
                        'select' => 'Select',
                        'match' => 'Match',
                        'fill-blank' => 'Fill in the blank',
                        'listen' => 'Listen',
                        'speak' => 'Speak',
                        'arrange' => 'Arrange',
                    ])
                    ->required()
                    ->live(),
                    
                Textarea::make('question')
                    ->required()
                    ->columnSpanFull(),
                    
                TextInput::make('order')
                    ->label('Order')
                    ->required()
                    ->numeric()
                    ->default(1),
                    
                TextInput::make('audio_src')
                    ->label('Audio Source'),
                    
                FileUpload::make('image_src')
                    ->label('Image')
                    ->disk('public')
                    ->image()
                    ->directory('challenges')
                    ->visibility('public'),
                    
                // Meta fields for different challenge types
                Textarea::make('meta.expected_text')
                    ->label('Expected Text (for speak challenges)')
                    ->hint('Leave empty to use question text as expected answer')
                    ->columnSpanFull(),
                    
                // Hidden field to store other meta data
                Hidden::make('meta.other'),
            ]);
    }
}
