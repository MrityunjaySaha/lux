import yfinance as yf
from music21 import stream, note, metadata, environment
import pandas as pd
from datetime import datetime

def fetch_stock_data(symbol):
    """Fetches the previous day's trading data for a given stock symbol from Yahoo Finance."""
    try:
        return yf.download(symbol, period="1d", interval="1m")
    except Exception as e:
        print(f"An error occurred while fetching data: {e}")
        return pd.DataFrame()

def stock_data_to_notes(stock_data):
    """Converts stock data to a sequence of music notes based on the adjusted close prices."""
    notes_list = []
    prices = stock_data['Adj Close']
    min_price = prices.min()
    price_range = prices.max() - min_price
    # Ensure price_range is not zero to avoid division by zero error
    price_range = max(price_range, 1)

    for price in prices:
        # Map the stock price to a musical note pitch within a reasonable range
        pitch = 60 + int(48 * (price - min_price) / price_range)  # MIDI note numbers from C4 to C6
        new_note = note.Note()
        new_note.pitch.midi = pitch
        notes_list.append(new_note)
    return notes_list

def create_music_sheet(notes_list, symbol, timestamp):
    """Creates a music sheet from notes, sets metadata, and saves it as MusicXML."""
    score = stream.Score()
    part = stream.Part()
    part.append(notes_list)
    score.append(part)
    
    # Setting the metadata for the music score
    score_metadata = metadata.Metadata()
    score_metadata.title = f"Stock Music for {symbol}"
    score_metadata.composer = "Yahoo Finance Data"
    score_metadata.date = timestamp
    score.metadata = score_metadata

    file_path = f"./{symbol}_stock_music_{timestamp.replace(':', '-')}.musicxml"
    score.write('musicxml', fp=file_path)
    print(f"Music sheet created: {file_path}")
    return file_path

def main():
    symbol = input("Enter the stock symbol (e.g., AAPL, MSFT): ")
    stock_data = fetch_stock_data(symbol)

    if not stock_data.empty:
        print(stock_data.to_string())  # Displaying the fetched stock data in the terminal
        
        notes_list = stock_data_to_notes(stock_data)
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        file_path = create_music_sheet(notes_list, symbol, timestamp)

        # Set the path to MuseScore application
        env = environment.Environment()
        env['musicxmlPath'] = '/Applications/MuseScore 4.app/Contents/MacOS/mscore'
        env['musescoreDirectPNGPath'] = '/Applications/MuseScore 4.app/Contents/MacOS/mscore'
        
        # Attempt to open the generated music sheet in MuseScore
        try:
            s = stream.Score()
            s.show('musicxml')
        except Exception as e:
            print(f"Error opening music sheet in MuseScore: {e}")
    else:
        print("No data available for the given symbol.")

if __name__ == "__main__":
    main()