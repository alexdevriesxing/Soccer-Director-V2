-- Add new columns to Player table
ALTER TABLE players
ADD COLUMN potential_ability INT,
ADD COLUMN current_ability INT,
ADD COLUMN personality_type VARCHAR(50),
ADD COLUMN professionalism INT,
ADD COLUMN ambition INT,
ADD COLUMN loyalty INT,
ADD COLUMN pressure INT,
ADD COLUMN consistency INT,
ADD COLUMN important_matches INT,
ADD COLUMN injury_proneness INT,
ADD COLUMN natural_fitness INT,
ADD COLUMN preferred_moves TEXT[],
ADD COLUMN preferred_role VARCHAR(20),
ADD COLUMN preferred_duty VARCHAR(20),
ADD COLUMN happiness INT,
ADD COLUMN morale INT,
ADD COLUMN last_trained TIMESTAMP,
ADD COLUMN training_level INT,
ADD COLUMN training_focus VARCHAR(50),
ADD COLUMN development_focus VARCHAR(50);

-- Create player_attributes table for detailed attributes
CREATE TABLE player_attributes (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  attribute_group VARCHAR(50),
  attribute_name VARCHAR(50) NOT NULL,
  attribute_value INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, attribute_group, attribute_name)
);

-- Create player_contracts table for contract history
CREATE TABLE player_contracts (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  club_id INTEGER REFERENCES clubs(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  weekly_wage DECIMAL(12,2) NOT NULL,
  yearly_salary_increase_percent DECIMAL(5,2) DEFAULT 0,
  release_clause DECIMAL(12,2),
  min_release_clause DECIMAL(12,2),
  relegation_release_clause DECIMAL(12,2),
  promotion_salary_increase_percent DECIMAL(5,2) DEFAULT 0,
  appearance_fee DECIMAL(10,2) DEFAULT 0,
  goal_bonus DECIMAL(10,2) DEFAULT 0,
  clean_sheet_bonus DECIMAL(10,2) DEFAULT 0,
  international_cap_bonus DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create player_morale_events table for tracking morale changes
CREATE TABLE player_morale_events (
  id SERIAL PRIMARY KEY,
  player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  morale_effect INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_player_attributes_player_id ON player_attributes(player_id);
CREATE INDEX idx_player_contracts_player_id ON player_contracts(player_id);
CREATE INDEX idx_player_contracts_club_id ON player_contracts(club_id);
CREATE INDEX idx_player_morale_events_player_id ON player_morale_events(player_id);
CREATE INDEX idx_player_morale_events_expires ON player_morale_events(expires_at) WHERE expires_at IS NOT NULL;
