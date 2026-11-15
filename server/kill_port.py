
import subprocess
import os

def kill_port_4000():
    try:
        # Find the PID of the process using port 4000
        result = subprocess.check_output('netstat -ano | findstr :4000', shell=True).decode()
        lines = result.strip().split('\n')
        for line in lines:
            parts = line.split()
            if len(parts) > 4:
                pid = parts[-1]
                print(f"Killing process {pid} on port 4000...")
                subprocess.run(f'taskkill /F /PID {pid}', shell=True)
        print("Port 4000 cleared successfully.")
    except subprocess.CalledProcessError:
        print("No process found running on port 4000.")
    except Exception as e:
        print(f"Error: {e}")

kill_port_4000()
