<?php

namespace App\Filament\Resources\Challenges\Schemas;

use App\Models\Challenge;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\Unit;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
// Section is not available in this Filament version; use direct component visibility instead
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
// Use untyped closures for reactive visibility/requirements to support current Filament version
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
                    ->label('Type')
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
                    ->label('Question')
                    ->required()
                    ->columnSpanFull(),
                    
                TextInput::make('order')
                    ->label('Order')
                    ->required()
                    ->numeric()
                    ->default(1),
                TextInput::make('audio_src')
                    ->label('Audio path / URL')
                    ->required(fn ($get) => $get('type') === 'listen'),
                FileUpload::make('image_src')
                    ->label('Image')
                    ->disk('public')
                    ->image()
                    ->directory('challenges')
                    ->visibility('public'),
                
                // Type-specific fields (no Section wrapper)
                Repeater::make('meta.pairs')
                    ->label('Match Pairs')
                    ->visible(fn ($get) => $get('type') === 'match')
                    ->schema([
                        TextInput::make('left')->label('Left')->required(),
                        TextInput::make('right')->label('Right')->required(),
                    ])
                    ->minItems(1)
                    ->columnSpanFull(),

                Textarea::make('meta.expected_text')
                    ->label('Expected phrase (optional)')
                    ->helperText('If empty, the question text will be used as expected phrase.')
                    ->visible(fn ($get) => $get('type') === 'speak')
                    ->columnSpanFull(),

                Textarea::make('arrange_help')
                    ->label('Instruction')
                    ->disabled()
                    ->dehydrated(false)
                    ->hint('Use the "Options" relation below to add tiles. Mark correct ones and set their position for the correct order.')
                    ->visible(fn ($get) => in_array($get('type'), ['arrange', 'fill-blank']))
                    ->columnSpanFull(),
            ]);
    }
}
