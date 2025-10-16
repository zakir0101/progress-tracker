#!/bin/bash

# IGCSE Math Progress Tracker Deployment Script
# Deploys to VPS and starts the Flask server

# Configuration
VPS_USER="zakir"
VPS_HOST="mamounelkheir.com"
REMOTE_DIR="/home/zakir/tracker"
LOCAL_DIR="."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Function to run SSH command with retry
ssh_with_retry() {
    local max_attempts=1
    local attempt=1
    local command="$1"

    while [ $attempt -le $max_attempts ]; do
        if ssh -o ConnectTimeout=10 -o BatchMode=yes ${VPS_USER}@${VPS_HOST} "$command"; then
            return 0
        else
            print_warning "SSH attempt $attempt failed, retrying..."
            sleep 2
            ((attempt++))
        fi
    done

    print_error "SSH command failed after $max_attempts attempts"
    return 1
}

# Function to check if command succeeded
check_success() {
    if [ $? -eq 0 ]; then
        print_success "$1"
    else
        print_error "$2"
        exit 1
    fi
}

# Function to create remote directory structure
create_remote_structure() {
    ssh_with_retry "
        mkdir -p ${REMOTE_DIR} &&
        mkdir -p ${REMOTE_DIR}/backups
    "
    check_success "Remote directory structure created" "Failed to create remote directory structure"
}

# Function to clear remote directory (preserve venv)
clear_remote_dir() {
    ssh_with_retry "
        if [ -d \"${REMOTE_DIR}\" ]; then
            # Remove everything except venv directory
            find \"${REMOTE_DIR}\" -mindepth 1 -maxdepth 1 ! -name 'venv' -exec rm -rf {} +
            echo 'Remote directory cleared (venv preserved)'
        else
            echo 'Remote directory does not exist, creating...'
            mkdir -p \"${REMOTE_DIR}\"
        fi
    "
    check_success "Remote directory cleared (venv preserved)" "Failed to clear remote directory"
}

# Function to copy files to VPS (excluding old/, tmp/, github-deployment/, venv/)
copy_files_to_vps() {

    # Create a temporary directory for filtered files
    TEMP_DIR=$(mktemp -d)

    # Copy all files except excluded directories
    rsync -av --progress \
        --exclude='.old/' \
        --exclude='.tmp/' \
        --exclude='github-deployment/' \
        --exclude='venv/' \
        --exclude='.git/' \
        --exclude='.claude/' \
        --exclude='google_oauth_setup_guide.md' \
        --exclude='unified_setup_guide.md' \
        --exclude='unified_api_specification.md' \
        --exclude='system_test_checklist.md' \
        --exclude='.env' \
        --exclude='*.log' \
        --exclude='__pycache__/' \
        "${LOCAL_DIR}/" "${TEMP_DIR}/" > /dev/null

    # Copy to VPS
    rsync -av --progress -e ssh \
        "${TEMP_DIR}/" "${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}/" > /dev/null

    # Clean up temporary directory
    rm -rf "${TEMP_DIR}"

    check_success "Files copied to VPS" "Failed to copy files to VPS"
}


# Function to test SSH connection
test_ssh_connection() {
    ssh -o ConnectTimeout=10 -o BatchMode=yes ${VPS_USER}@${VPS_HOST} "echo 'SSH connection successful'"
    check_success "SSH connection successful" "SSH connection failed. Please check:
    - SSH configuration
    - Network connectivity
    - Server availability at ${VPS_HOST}
    - SSH key authentication"
}

# Main deployment function
main() {
    echo "=== IGCSE Math Progress Tracker Deployment ==="
    echo "Target: ${VPS_USER}@${VPS_HOST}:${REMOTE_DIR}"
    echo ""

    sleep_time=2
    # Test SSH connection first
    print_status "Testing SSH connection to ${VPS_USER}@${VPS_HOST}..."
    # sleep ${sleep_time}
    test_ssh_connection
    echo "================================================================================="

    # Create remote directory structure
    print_status "Creating remote directory structure..."
    # sleep ${sleep_time}
    create_remote_structure
    echo "================================================================================="

    # Clear remote directory
    print_status "Clearing remote directory ${REMOTE_DIR} (preserving venv)..."
    # sleep ${sleep_time}
    clear_remote_dir
    echo "================================================================================="

    # Copy files to VPS
    print_status "Copying files to VPS (excluding old/, tmp/, github-deployment/, venv/)..."
    # sleep ${sleep_time}
    copy_files_to_vps
    echo "================================================================================="


    ssh_with_retry "
        cd ${REMOTE_DIR} &&
          bash start_server.sh 
        "


}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main
