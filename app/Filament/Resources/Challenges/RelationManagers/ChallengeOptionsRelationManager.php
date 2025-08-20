<?php

namespace App\Filament\Resources\Challenges\RelationManagers;

use App\Filament\Resources\ChallengeOptions\ChallengeOptionResource;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Schemas\Schema;

class ChallengeOptionsRelationManager extends RelationManager
{
    protected static string $relationship = 'options';

    protected static ?string $recordTitleAttribute = 'text';

    protected static ?string $title = 'Варіанти відповідей';

    protected static ?string $relatedResource = ChallengeOptionResource::class;

    public function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Textarea::make('text')
                    ->label('Текст відповіді')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('position')
                    ->label('Позиція')
                    ->numeric()
                    ->helperText('Використовується для впорядкування правильної послідовності у вправах Arrange/Fill-blank.'),
                Toggle::make('is_correct')
                    ->label('Правильна відповідь')
                    ->required(),
                TextInput::make('audio_src')
                    ->label('Шлях до аудіо'),
                FileUpload::make('image_src')
                    ->label('Зображення')
                    ->disk('public')
                    ->image()
                    ->directory('challenge-options')
                    ->visibility('public'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            // If supported by your Filament version, enable drag-and-drop reordering by position
            // ->reorderable('position')
            ->columns([
                TextColumn::make('text')
                    ->label('Текст відповіді')
                    ->limit(30)
                    ->searchable(),
                TextColumn::make('position')
                    ->label('Позиція')
                    ->sortable(),
                IconColumn::make('is_correct')
                    ->label('Правильна')
                    ->boolean(),
                TextColumn::make('audio_src')
                    ->label('Аудіо')
                    ->toggleable(isToggledHiddenByDefault: true),
                ImageColumn::make('image_src')
                    ->label('Зображення')
                    ->disk('public')
                    ->getStateUsing(function ($record) {
                        $p = ltrim((string)($record->image_src ?? ''), '/');
                        if ($p === '') return $p;
                        if (str_starts_with($p, 'storage/')) $p = substr($p, 8);
                        if (str_starts_with($p, 'public/')) $p = substr($p, 7);
                        return $p; // relative path resolved via public disk
                    })
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->label('Створено')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->label('Оновлено')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('position')
            ->headerActions([
                CreateAction::make()
                    ->label('Додати варіант відповіді'),
            ])
            ->actions([
                EditAction::make()
                    ->label('Редагувати'),
                DeleteAction::make()
                    ->label('Видалити'),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->label('Видалити вибрані'),
                ]),
            ]);
    }
}
