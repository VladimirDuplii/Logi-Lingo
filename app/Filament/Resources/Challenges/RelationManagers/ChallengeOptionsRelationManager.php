<?php

namespace App\Filament\Resources\Challenges\RelationManagers;

use App\Filament\Resources\ChallengeOptions\ChallengeOptionResource;
use App\Models\ChallengeOption;
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
use Filament\Forms\Get;
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
            ])
            ->afterValidation(function ($data) {
                $this->validateOptions($data);
            });
    }
    
    protected function validateOptions(array $data): void
    {
        $challenge = $this->getOwnerRecord();
        $type = $challenge->type;
        if ($type === 'match') {
            throw new \Exception('Match type uses pairs (meta.pairs); options are not editable here.');
        }
        
        // Get all options for this challenge (including the current one being edited)
        $allOptions = ChallengeOption::where('challenge_id', $challenge->id)->get();
        
        if ($type === 'select') {
            // Count how many correct options there will be after this update
            $correctCount = $allOptions->where('is_correct', true)->count();
            
            // If this is a new option being created
            if (!isset($data['id'])) {
                if ($data['is_correct']) {
                    $correctCount++;
                }
            } else {
                // If this is an edit, adjust count
                $existingOption = $allOptions->where('id', $data['id'])->first();
                if ($existingOption) {
                    if ($existingOption->is_correct && !$data['is_correct']) {
                        $correctCount--;
                    } elseif (!$existingOption->is_correct && $data['is_correct']) {
                        $correctCount++;
                    }
                }
            }
            
            if ($correctCount !== 1) {
                throw new \Exception('Select challenges must have exactly one correct option.');
            }
        }
        
        if (in_array($type, ['arrange', 'fill-blank'])) {
            if ($allOptions->count() < 2) {
                throw new \Exception('Arrange/Fill-blank challenges must have at least 2 options.');
            }
            
            // Check positions for correct options
            if ($data['is_correct'] && empty($data['position'])) {
                throw new \Exception('Correct options for arrange/fill-blank challenges must have a position.');
            }
            
            // Check for duplicate positions among correct options
            $positions = [];
            foreach ($allOptions as $option) {
                if ($option->is_correct && $option->position) {
                    $positions[] = $option->position;
                }
            }
            
            if ($data['is_correct'] && $data['position']) {
                $positions[] = $data['position'];
            }
            
            if (count($positions) !== count(array_unique($positions))) {
                throw new \Exception('Positions must be unique among correct options.');
            }
        }
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('text')
                    ->label('Текст відповіді')
                    ->limit(30)
                    ->searchable(),
                TextColumn::make('position')
                    ->label('Позиція')
                    ->numeric()
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
                        $p = ltrim((string) ($record->image_src ?? ''), '/');
                        if ($p === '')
                            return $p;
                        if (str_starts_with($p, 'storage/'))
                            $p = substr($p, 8);
                        if (str_starts_with($p, 'public/'))
                            $p = substr($p, 7);
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
            ->defaultSort('position', 'asc')
            ->headerActions([
                CreateAction::make()
                    ->label('Додати варіант відповіді')
                    ->mutateFormDataUsing(function (array $data): array {
                        // Auto-normalize positions before saving
                        $this->normalizePositions($data);
                        return $data;
                    }),
                Action::make('normalize_positions')
                    ->label('Нормалізувати позиції')
                    ->action(function () {
                        $this->normalizeAllPositions();
                    })
                    ->color('warning'),
            ])
            ->actions([
                EditAction::make()
                    ->label('Редагувати')
                    ->mutateFormDataUsing(function (array $data): array {
                        // Auto-normalize positions before saving
                        $this->normalizePositions($data);
                        return $data;
                    }),
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
    
    protected function normalizePositions(array &$data): void
    {
        $challenge = $this->getOwnerRecord();
        if (!in_array($challenge->type, ['arrange', 'fill-blank'])) {
            return;
        }
        
        // Get all correct options with positions
        $correctOptions = ChallengeOption::where('challenge_id', $challenge->id)
            ->where('is_correct', true)
            ->whereNotNull('position')
            ->orderBy('position')
            ->get();
        
        // If this is a new correct option, add it to the list
        if ($data['is_correct'] && !empty($data['position'])) {
            $positions = $correctOptions->pluck('position')->toArray();
            $positions[] = $data['position'];
            $positions = array_unique($positions);
            sort($positions);
            
            // Normalize to 1, 2, 3, ...
            $normalizedPositions = array_values(array_map(fn($i) => $i + 1, array_keys($positions)));
            $data['position'] = $normalizedPositions[array_search($data['position'], $positions)];
        }
    }
    
    protected function normalizeAllPositions(): void
    {
        $challenge = $this->getOwnerRecord();
        if (!in_array($challenge->type, ['arrange', 'fill-blank'])) {
            return;
        }
        
        // Get all correct options with positions, ordered by current position
        $correctOptions = ChallengeOption::where('challenge_id', $challenge->id)
            ->where('is_correct', true)
            ->whereNotNull('position')
            ->orderBy('position')
            ->get();
        
        // Renumber them sequentially starting from 1
        foreach ($correctOptions as $index => $option) {
            $option->update(['position' => $index + 1]);
        }
    }
}
