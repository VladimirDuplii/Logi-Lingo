<?php

namespace App\Filament\Resources\Challenges\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ChallengesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('lesson.title')
                    ->label('Lesson')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('type')
                    ->searchable()
                    ->badge()
                    ->color(fn(string $state): string => match ($state) {
                        'select' => 'success',
                        'match' => 'info',
                        'fill-blank' => 'warning',
                        'listen' => 'danger',
                        'speak' => 'primary',
                        'arrange' => 'secondary',
                        default => 'gray',
                    }),
                TextColumn::make('question')
                    ->limit(30)
                    ->searchable(),
                TextColumn::make('order')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('audio_src')
                    ->toggleable(isToggledHiddenByDefault: true),
                ImageColumn::make('image_src')
                    ->getStateUsing(function ($record) {
                        $p = ltrim((string) ($record->image_src ?? ''), '/');
                        if ($p === '')
                            return $p;
                        if (str_starts_with($p, 'storage/'))
                            $p = substr($p, 8);
                        if (str_starts_with($p, 'public/'))
                            $p = substr($p, 7);
                        return '/storage/' . ltrim($p, '/');
                    })
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
            ->defaultSort('order')
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
