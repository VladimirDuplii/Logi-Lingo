<?php

namespace App\Filament\Resources\Challenges\Schemas\Types;

use Filament\Schemas\Components\Fieldset;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;

class SelectType
{
    public static function getFieldset(): Fieldset
    {
        return Fieldset::make('Select Challenge Content')
            ->schema([
                Repeater::make('content.options')
                    ->label('Answer Options')
                    ->schema([
                        TextInput::make('text')
                            ->label('Option Text')
                            ->required()
                            ->maxLength(255),
                        Toggle::make('is_correct')
                            ->label('Is Correct Answer')
                            ->default(false),
                    ])
                    ->columns(2)
                    ->minItems(2)
                    ->maxItems(6)
                    ->itemLabel(fn (array $state): ?string => $state['text'] ?? null)
                    ->required(),
            ])
            ->visible(fn ($get) => $get('type') === 'select');
    }
}