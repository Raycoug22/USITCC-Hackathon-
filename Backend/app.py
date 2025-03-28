<<<<<<< HEAD
from flask import Flask, request, jsonify
from flask_cors import CORS
from sql import get_db_connection
import os

app = Flask(__name__)
CORS(app)

# ---------- AUTH ----------
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    email = data['email']
    password = data['password']
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO Users (Username, Email, Password, Status) VALUES (%s, %s, %s, 'active')",
                       (username, email, password))
        conn.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data['email']
    password = data['password']
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Users WHERE Email = %s", (email,))
    user = cursor.fetchone()
    if user and user['Password'] == password:
        return jsonify({'message': 'Login successful', 'user_id': user['User_ID']}), 200
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/update-profile', methods=['PUT'])
def update_profile():
    data = request.json
    user_id = data['user_id']
    bio = data.get('bio')
    interests = data.get('interests', [])
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if bio:
            cursor.execute("UPDATE Users SET Bio = %s WHERE User_ID = %s", (bio, user_id))
        cursor.execute("DELETE FROM Users_Interests WHERE User_ID = %s", (user_id,))
        for interest_id in interests:
            cursor.execute("INSERT INTO Users_Interests (Interest_ID, User_ID) VALUES (%s, %s)", (interest_id, user_id))
        conn.commit()
        return jsonify({'message': 'Profile updated'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/get-matches/<int:user_id>', methods=['GET'])
def get_matches(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT DISTINCT u.User_ID, u.Username, u.Email
        FROM Users u
        JOIN Users_Interests ui ON u.User_ID = ui.User_ID
        WHERE ui.Interest_ID IN (
            SELECT Interest_ID FROM Users_Interests WHERE User_ID = %s
        ) AND u.User_ID != %s
        LIMIT 3
    """, (user_id, user_id))
    matches = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify({'matches': matches})

# ---------- EVENTS ----------
@app.route('/api/events', methods=['GET'])
def get_events():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Events")
    events = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(events)

@app.route('/api/events/<int:event_id>', methods=['GET'])
def get_event(event_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Events WHERE Event_ID = %s", (event_id,))
    event = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(event)

@app.route('/api/events/rsvp', methods=['POST'])
def rsvp_event():
    data = request.json
    user_id = data['user_id']
    event_id = data['event_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO Users_Events (Users_ID, Event_ID) VALUES (%s, %s)", (user_id, event_id))
        conn.commit()
        return jsonify({'message': 'RSVP successful'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------- GROUPS ----------
@app.route('/api/groups', methods=['GET'])
def get_groups():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM `Groups`")
    groups = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(groups)

@app.route('/api/groups/<int:group_id>', methods=['GET'])
def get_group(group_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM `Groups` WHERE Group_ID = %s", (group_id,))
    group = cursor.fetchone()
    cursor.close()
    conn.close()
    return jsonify(group)

@app.route('/api/groups/join', methods=['POST'])
def join_group():
    data = request.json
    user_id = data['user_id']
    group_id = data['group_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO Users_Groups (Group_ID, User_ID) VALUES (%s, %s)", (group_id, user_id))
        conn.commit()
        return jsonify({'message': 'Group joined'}), 200
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------- FORUMS ----------
@app.route('/api/forums/<int:group_id>', methods=['GET'])
def get_forums(group_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Forums WHERE Group_ID = %s", (group_id,))
    forums = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(forums)

@app.route('/api/forums/post', methods=['POST'])
def post_forum():
    data = request.json
    topic = data['topic']
    user_id = data['user_id']
    group_id = data['group_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO Forums (Topic, Created_By, Group_ID) VALUES (%s, %s, %s)", (topic, user_id, group_id))
        conn.commit()
        return jsonify({'message': 'Forum created'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

@app.route('/api/forums/reply', methods=['POST'])
def reply_forum():
    data = request.json
    forum_id = data['forum_id']
    content = data['content']
    user_id = data['user_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO Posts (Content, Forum_ID, User_ID) VALUES (%s, %s, %s)", (content, forum_id, user_id))
        conn.commit()
        return jsonify({'message': 'Reply posted'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------- INTERESTS ----------
@app.route('/api/interests', methods=['GET'])
def get_interests():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM Interests")
    interests = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(interests)

@app.route('/api/interests/add', methods=['POST'])
def add_interest():
    data = request.json
    user_id = data['user_id']
    interest_id = data['interest_id']
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("INSERT INTO Users_Interests (Interest_ID, User_ID) VALUES (%s, %s)", (interest_id, user_id))
        conn.commit()
        return jsonify({'message': 'Interest added'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 400
    finally:
        cursor.close()
        conn.close()

# ---------- Run App ----------
if __name__ == '__main__':
    app.run(debug=True)
=======

>>>>>>> 2ebe61ea94b7d11e8decf98c48087140b00b7e7e
