<?php

namespace App\Filament\Resources\Lessons\RelationManagers;

use App\Models\Challenge;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Actions\EditAction;
use Filament\Actions\DeleteAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Schemas\Schema;

class ChallengesRelationManager extends RelationManager
{
    protected static string $relationship = 'challenges';

    protected static ?string $title = 'Завдання уроку';

    protected static ?string $recordTitleAttribute = 'question';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextInput::make('type')
                    ->label('Тип')
                    ->required()
                    ->maxLength(50),
                Textarea::make('question')
                    ->label('Питання')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('order')
                    ->label('Порядок')
                    ->numeric()
                    ->required(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('order')
                    ->label('№')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('type')
                    ->label('Тип')
                    ->badge()
                    ->sortable(),
                TextColumn::make('question')
                    ->label('Питання')
                    ->limit(60)
                    ->searchable(),
            ])
            ->defaultSort('order')
            ->headerActions([])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([]);
    }
}
