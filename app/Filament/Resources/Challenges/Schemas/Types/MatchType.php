<?php

namespace App\Filament\Resources\Challenges\Schemas\Types;

use Filament\Schemas\Components\Fieldset;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;

class MatchType
{
    public static function getFieldset(): Fieldset
    {
        return Fieldset::make('Match Challenge Content')
            ->schema([
                Repeater::make('content.left')
                    ->label('Left Side Items')
                    ->schema([
                        TextInput::make('text')
                            ->label('Left Item Text')
                            ->required()
                            ->maxLength(255),
                    ])
                    ->minItems(2)
                    ->maxItems(8)
                    ->itemLabel(fn (array $state): ?string => $state['text'] ?? null)
                    ->required()
                    ->columnSpan(1),
                Repeater::make('content.right')
                    ->label('Right Side Items')
                    ->schema([
                        TextInput::make('text')
                            ->label('Right Item Text')
                            ->required()
                            ->maxLength(255),
                    ])
                    ->minItems(2)
                    ->maxItems(8)
                    ->itemLabel(fn (array $state): ?string => $state['text'] ?? null)
                    ->required()
                    ->columnSpan(1),
            ])
            ->columns(2)
            ->visible(fn ($get) => $get('type') === 'match');
    }
}