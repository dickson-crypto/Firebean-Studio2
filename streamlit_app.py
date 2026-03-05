import streamlit as st
import streamlit.components.v1 as components

# 1. Access the secret key from Streamlit's dashboard
api_key = st.secrets.get("GEMINI_API_KEY", "")

# 2. Read your HTML file
with open("index.html", "r", encoding="utf-8") as f:
    html_code = f.read()

# 3. Inject the secret key safely
final_html = html_code.replace("{{GEMINI_API_KEY}}", api_key)

# 4. Show the app full-screen
st.set_page_config(layout="wide")
components.html(final_html, height=1000, scrolling=True)
