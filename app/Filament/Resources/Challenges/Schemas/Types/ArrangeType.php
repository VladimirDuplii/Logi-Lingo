<?php

namespace App\Filament\Resources\Challenges\Schemas\Types;

use Filament\Schemas\Components\Fieldset;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;

class ArrangeType
{
    public static function getFieldset(): Fieldset
    {
        return Fieldset::make('Arrange Challenge Content')
            ->schema([
                Textarea::make('content.instructions')
                    ->label('Instructions')
                    ->placeholder('e.g., "Arrange these words to form a correct sentence"')
                    ->rows(2)
                    ->maxLength(500),
                Repeater::make('content.items')
                    ->label('Items to Arrange')
                    ->schema([
                        TextInput::make('text')
                            ->label('Item Text')
                            ->required()
                            ->maxLength(100),
                        TextInput::make('correct_position')
                            ->label('Correct Position (1, 2, 3...)')
                            ->numeric()
                            ->required()
                            ->helperText('The correct position of this item in the final arrangement'),
                    ])
                    ->columns(2)
                    ->minItems(2)
                    ->maxItems(12)
                    ->itemLabel(fn (array $state): ?string => 'Position ' . ($state['correct_position'] ?? '?') . ': ' . ($state['text'] ?? ''))
                    ->required(),
            ])
            ->visible(fn ($get) => $get('type') === 'arrange');
    }
}