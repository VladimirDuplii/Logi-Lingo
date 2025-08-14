<?php

namespace App\Filament\Resources\ChallengeOptions\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ChallengeOptionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('challenge.question')
                    ->label('Challenge')
                    ->limit(30)
                    ->searchable()
                    ->sortable(),
                TextColumn::make('text')
                    ->limit(30)
                    ->searchable(),
                IconColumn::make('is_correct')
                    ->boolean(),
                TextColumn::make('audio_src')
                    ->toggleable(isToggledHiddenByDefault: true),
                ImageColumn::make('image_src')
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
