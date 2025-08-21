<?php

namespace App\Filament\Resources\Lessons\RelationManagers;

use App\Models\Challenge;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Actions\CreateAction;
use Filament\Actions\EditAction;
use Filament\Actions\DeleteAction;
use Filament\Tables\Filters\SelectFilter;
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
                Select::make('type')
                    ->label('Тип')
                    ->options([
                        'select' => 'Select',
                        'match' => 'Match',
                        'fill-blank' => 'Fill in the blank',
                        'listen' => 'Listen',
                        'speak' => 'Speak',
                        'arrange' => 'Arrange',
                    ])
                    ->required(),
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
            ->modifyQueryUsing(function ($query) {
                return $query->withCount('options');
            })
            ->columns([
                TextColumn::make('order')
                    ->label('№')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('type')
                    ->label('Тип')
                    ->badge()
                    ->sortable(),
                TextColumn::make('options_count')
                    ->label('Опцій')
                    ->numeric()
                    ->sortable(),
                TextColumn::make('question')
                    ->label('Питання')
                    ->limit(60)
                    ->searchable(),
            ])
            ->defaultSort('order')
            ->reorderable('order')
            ->filters([
                SelectFilter::make('type')
                    ->label('Тип')
                    ->options([
                        'select' => 'Select',
                        'match' => 'Match',
                        'fill-blank' => 'Fill in the blank',
                        'listen' => 'Listen',
                        'speak' => 'Speak',
                        'arrange' => 'Arrange',
                    ]),
            ])
            ->headerActions([
                CreateAction::make()
                    ->label('Створити завдання')
                    ->mutateFormDataUsing(function (array $data): array {
                        $lessonId = $this->getOwnerRecord()->id;
                        $data['lesson_id'] = $lessonId;
                        if (empty($data['order'])) {
                            $max = \App\Models\Challenge::where('lesson_id', $lessonId)->max('order') ?? 0;
                            $data['order'] = $max + 1;
                        }
                        return $data;
                    }),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([]);
    }
}
