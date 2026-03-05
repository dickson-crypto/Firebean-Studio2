import streamlit as st
import google.generativeai as genai

# Page configuration
st.set_page_config(page_title="Firebean Studio Gemini App", layout="wide")

# 1. Securely access the API key from Streamlit Secrets
# You will add 'GEMINI_API_KEY' in the Streamlit Cloud dashboard later
try:
    api_key = st.secrets["GEMINI_API_KEY"]
    genai.configure(api_key=api_key)
except KeyError:
    st.error("Please add your GEMINI_API_KEY to the Streamlit Secrets.")
    st.stop()

st.title("🚀 Gemini AI Assistant")

# Simple Chat Interface
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# React to user input
if prompt := st.chat_input("How can I help you today?"):
    st.chat_message("user").markdown(prompt)
    st.session_state.messages.append({"role": "user", "content": prompt})

    # Call Gemini API
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        with st.chat_message("assistant"):
            st.markdown(response.text)
        
        st.session_state.messages.append({"role": "assistant", "content": response.text})
    except Exception as e:
        st.error(f"An error occurred: {e}")
