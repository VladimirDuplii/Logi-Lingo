<?php

namespace App\Filament\Resources\Challenges\Schemas\Types;

use Filament\Forms\Components\Fieldset;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;

class FillBlankType
{
    public static function getFieldset(): Fieldset
    {
        return Fieldset::make('Fill in the Blank Challenge Content')
            ->schema([
                Textarea::make('content.text_with_blanks')
                    ->label('Text with Blanks')
                    ->placeholder('Use [BLANK] to indicate where blanks should appear')
                    ->helperText('Use [BLANK] to mark where students should fill in answers')
                    ->required()
                    ->rows(3),
                Repeater::make('content.blanks')
                    ->label('Blank Answers')
                    ->schema([
                        TextInput::make('correct_answer')
                            ->label('Correct Answer')
                            ->required()
                            ->maxLength(100),
                        TextInput::make('position')
                            ->label('Blank Position (1, 2, 3...)')
                            ->numeric()
                            ->required()
                            ->helperText('Position of this blank in the text'),
                    ])
                    ->columns(2)
                    ->minItems(1)
                    ->maxItems(10)
                    ->itemLabel(fn (array $state): ?string => 'Position ' . ($state['position'] ?? '?') . ': ' . ($state['correct_answer'] ?? ''))
                    ->required(),
            ])
            ->visible(fn ($get) => $get('type') === 'fill-blank');
    }
}