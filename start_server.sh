


# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color


print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to show deployment summary
deployment_summary() {
    print_success "Deployment completed successfully!"
    echo ""
    echo "=== Deployment Summary ==="
    echo "Remote Server: ${VPS_USER}@${VPS_HOST}"
    echo "Remote Directory: ${REMOTE_DIR}"
    echo "Files Deployed: ✅"
    echo "Python Environment: ✅"
    echo "Flask Server: Manual start required"
    echo ""
    echo "Access URLs (after starting server):"
    echo "- Student Tracker: http://${VPS_HOST}:5000/student_tracker.html"
    echo "- Teacher Dashboard: http://${VPS_HOST}:5000/teacher_dashboard.html"
    echo "- API: http://${VPS_HOST}:5000/"
    echo ""
    echo "=== MANUAL SERVER STARTUP ==="
    echo "Since automated server management causes SSH issues, start the server manually:"
    echo ""
    echo "1. SSH to the server:"
    echo "   ssh ${VPS_USER}@${VPS_HOST}"
    echo ""
    echo "2. Navigate to the directory and start the server:"
    echo "   cd ${REMOTE_DIR}"
    echo "   source venv/bin/activate"
    echo "   nohup python3 app.py > flask.log 2>&1 &"
    echo ""
    echo "3. Check if server is running:"
    echo "   ps aux | grep 'python3.*app.py' | grep -v grep"
    echo ""
    echo "4. View server logs:"
    echo "   tail -f flask.log"
    echo ""
    echo "To stop the server:"
    echo "   pkill -f 'python3.*app.py'"
}


# -------------------------------------------------------
# -------------------------------------------------------
# -------------------------------------------------------

# Set up Python environment print_status "Setting up Python environment on VPS..."
print_status "Setting up Python environment on VPS..."

if [ ! -d "venv" ]; then
    python3 -m venv venv &&
    echo 'Created new virtual environment' 
else
    echo 'Virtual environment already exists'
fi 

source venv/bin/activate &&
# Only install/update if requirements.txt is newer than last install
if [ requirements.txt -nt .last_install ] || [ ! -f .last_install ]; then
    if command -v uv >/dev/null 2>&1; then
        uv pip install -r requirements.txt
    else
        pip install -r requirements.txt
    fi &&
    touch .last_install
    echo 'Dependencies installed/updated'
else
    echo 'Dependencies already up to date'
fi
echo "================================================================================="



print_status "Killing old Flask server processes..."
# Only kill processes that are running the actual app.py file
# This avoids matching SSH commands or other python processes
for pid in $(ps aux | grep 'python app.py' | grep -v grep | awk '{print $2}'); do
    # Double-check it's actually running app.py and not some SSH command
    if ps -p $pid -o command= | grep -q 'python app.py'; then
        echo 'Killing Flask process:' $pid 
         kill -9 $pid 2>/dev/null
    fi
done 

# echo 'Flask processes killed'

echo "================================================================================="


print_status "Starting Flask server on VPS..."
# Use a very simple approach to start the server
source venv/bin/activate &&
python app.py > flask.log 2>&1  &
echo 'Server started' 

echo "================================================================================="



# Show deployment summary
# deployment_summary
