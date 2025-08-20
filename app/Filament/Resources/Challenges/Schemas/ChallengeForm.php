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
use Filament\Forms\Get;
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
                    ->default(function (Get $get) {
                        $lessonId = $get('lesson_id');
                        if (!$lessonId) return 1;
                        
                        $maxOrder = Challenge::where('lesson_id', $lessonId)->max('order') ?? 0;
                        return $maxOrder + 1;
                    }),
                    
                TextInput::make('audio_src')
                    ->label('Audio Source')
                    ->hidden(function (Get $get) {
                        return $get('type') !== 'listen';
                    })
                    ->required(function (Get $get) {
                        return $get('type') === 'listen';
                    }),
                    
                FileUpload::make('image_src')
                    ->label('Image')
                    ->disk('public')
                    ->image()
                    ->directory('challenges')
                    ->visibility('public'),
                    
                // Meta fields for 'speak' type
                TextInput::make('meta.expected_text')
                    ->label('Expected Text')
                    ->hint('Leave empty to use question text as expected answer')
                    ->hidden(function (Get $get) {
                        return $get('type') !== 'speak';
                    })
                    ->columnSpanFull(),
                    
                // Meta fields for 'match' type
                Repeater::make('meta.pairs')
                    ->label('Match Pairs')
                    ->schema([
                        TextInput::make('left')
                            ->label('Left Side')
                            ->required(),
                        TextInput::make('right')
                            ->label('Right Side')
                            ->required(),
                    ])
                    ->hidden(function (Get $get) {
                        return $get('type') !== 'match';
                    })
                    ->minItems(1)
                    ->columnSpanFull(),
                    
                // Hidden field to store other meta data
                Hidden::make('meta.other'),
            ])
            ->afterValidation(function ($data) {
                self::validateChallengeData($data);
            });
    }
    
    protected static function validateChallengeData(array $data): void
    {
        $type = $data['type'] ?? null;
        
        if ($type === 'match') {
            $pairs = $data['meta']['pairs'] ?? [];
            
            if (empty($pairs)) {
                throw new \Exception('Match challenges must have at least one pair.');
            }
            
            $seenPairs = [];
            foreach ($pairs as $pair) {
                if (empty($pair['left']) || empty($pair['right'])) {
                    throw new \Exception('All match pairs must have non-empty left and right values.');
                }
                
                $pairKey = $pair['left'] . '|' . $pair['right'];
                if (in_array($pairKey, $seenPairs)) {
                    throw new \Exception('Duplicate match pairs are not allowed.');
                }
                $seenPairs[] = $pairKey;
            }
        }
        
        if ($type === 'listen' && empty($data['audio_src'])) {
            throw new \Exception('Listen challenges must have an audio source.');
        }
    }
}
