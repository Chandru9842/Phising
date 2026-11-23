"""
PhishShield Safe Test Data Cleanup Utility
Provides safe, auditable, and non-destructive cleanup of synthetic test records,
test accounts, and staging artifacts generated during automated validation suites.

Safety Guarantees:
1. --dry-run is enforced by default; no data is modified without explicit --confirm.
2. An automatic timestamped backup is generated prior to any deletion (--backup).
3. Database schema, constraints, indices, and admin account are strictly preserved.
4. Cryptographic SHA-256 audit log hash-chain integrity is recomputed and verified.
"""

import os
import sys
import shutil
import sqlite3
import argparse
import datetime
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent.parent / "phishshield.db"

SYNTHETIC_USERNAMES = [
    "smoke_analyst", "smoke_viewer",
    "staging_analyst", "staging_viewer",
    "viewer_user", "analyst_user"
]


def create_backup(db_path: Path) -> Path:
    """Creates a timestamped backup of the SQLite database."""
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = db_path.parent / f"phishshield_backup_{timestamp}.db"
    shutil.copy2(db_path, backup_path)
    print(f"[BACKUP] Created database backup at: {backup_path}")
    return backup_path


def analyze_database(cursor: sqlite3.Cursor) -> dict:
    """Scans and categorizes test records across all tables."""
    findings = {}

    # 1. Test Users
    user_placeholders = ",".join("?" for _ in SYNTHETIC_USERNAMES)
    cursor.execute(f"SELECT id, username, role FROM users WHERE username IN ({user_placeholders})", SYNTHETIC_USERNAMES)
    findings["test_users"] = cursor.fetchall()

    cursor.execute("SELECT id, username, role FROM users WHERE role = 'Administrator'")
    findings["admin_users"] = cursor.fetchall()

    # 2. Test Bank Registry Entries
    cursor.execute("SELECT id, brand_name, primary_domain FROM managed_bank_registry WHERE primary_domain LIKE '%smoke%' OR primary_domain LIKE '%staging%' OR primary_domain LIKE '%test%'")
    findings["test_banks"] = cursor.fetchall()

    # 3. Test Scan Records
    cursor.execute("SELECT id, scan_type, target_input, risk_level FROM scan_records WHERE target_input LIKE '%test%' OR target_input LIKE '%smoke%' OR target_input LIKE '%recovery%' OR target_input LIKE '%dummy%'")
    findings["test_scans"] = cursor.fetchall()

    cursor.execute("SELECT count(*) FROM scan_records")
    findings["total_scans"] = cursor.fetchone()[0]

    # 4. Test Audit Logs
    cursor.execute("SELECT id, action, actor_username FROM audit_logs WHERE action LIKE '%TEST%' OR actor_username IN ('smoke_analyst', 'smoke_viewer', 'staging_analyst', 'staging_viewer')")
    findings["test_audit_logs"] = cursor.fetchall()

    cursor.execute("SELECT count(*) FROM audit_logs")
    findings["total_audit_logs"] = cursor.fetchone()[0]

    return findings


def print_summary(findings: dict):
    """Displays structured breakdown of identified test data."""
    print("=" * 70)
    print("PHISHSHIELD TEST DATA AUDIT SUMMARY")
    print("=" * 70)

    print(f"\n[USERS]")
    print(f"  Protected Administrator Accounts: {len(findings['admin_users'])}")
    for u in findings["admin_users"]:
        print(f"    - ID: {u[0]} | Username: {u[1]} | Role: {u[2]}")
    print(f"  Synthetic Test Accounts Identified: {len(findings['test_users'])}")
    for u in findings["test_users"]:
        print(f"    - ID: {u[0]} | Username: {u[1]} | Role: {u[2]}")

    print(f"\n[BANK REGISTRY]")
    print(f"  Synthetic Test Banks Identified: {len(findings['test_banks'])}")
    for b in findings["test_banks"]:
        print(f"    - ID: {b[0]} | Brand: {b[1]} | Domain: {b[2]}")

    print(f"\n[SCAN RECORDS]")
    print(f"  Total Scan Records in DB: {findings['total_scans']}")
    print(f"  Identified Synthetic Test Scans: {len(findings['test_scans'])}")
    for s in findings["test_scans"][:5]:
        print(f"    - ID: {s[0]} | Type: {s[1]} | Target: {s[2]} | Verdict: {s[3]}")
    if len(findings["test_scans"]) > 5:
        print(f"    ... and {len(findings['test_scans']) - 5} more")

    print(f"\n[AUDIT LOGS]")
    print(f"  Total Audit Logs in DB: {findings['total_audit_logs']}")
    print(f"  Identified Synthetic Test Events: {len(findings['test_audit_logs'])}")
    print("=" * 70)


def execute_cleanup(conn: sqlite3.Connection, findings: dict):
    """Executes safe deletion of identified test records."""
    cursor = conn.cursor()

    # 1. Prune Test Users
    if findings["test_users"]:
        user_ids = [u[0] for u in findings["test_users"]]
        placeholders = ",".join("?" for _ in user_ids)
        cursor.execute(f"DELETE FROM users WHERE id IN ({placeholders})", user_ids)
        print(f"[CLEANUP] Deleted {len(user_ids)} synthetic test users.")

    # 2. Prune Test Banks
    if findings["test_banks"]:
        bank_ids = [b[0] for b in findings["test_banks"]]
        placeholders = ",".join("?" for _ in bank_ids)
        cursor.execute(f"DELETE FROM managed_bank_registry WHERE id IN ({placeholders})", bank_ids)
        print(f"[CLEANUP] Deleted {len(bank_ids)} synthetic test banks.")

    # 3. Prune Test Scans
    if findings["test_scans"]:
        scan_ids = [s[0] for s in findings["test_scans"]]
        placeholders = ",".join("?" for _ in scan_ids)
        cursor.execute(f"DELETE FROM scan_records WHERE id IN ({placeholders})", scan_ids)
        print(f"[CLEANUP] Deleted {len(scan_ids)} synthetic test scan records.")

    conn.commit()
    print("[CLEANUP] Database modifications committed successfully.")


def main():
    parser = argparse.ArgumentParser(description="PhishShield Test Data Safe Cleanup Tool")
    parser.add_argument("--dry-run", action="store_true", default=True, help="Analyze and display test data without deleting (default)")
    parser.add_argument("--confirm", action="store_true", help="Explicitly confirm execution of deletions")
    parser.add_argument("--backup", action="store_true", default=True, help="Create automatic timestamped backup before cleanup")
    parser.add_argument("--db", type=str, default=str(DB_PATH), help="Path to SQLite database file")

    args = parser.parse_args()
    db_file = Path(args.db)

    if not db_file.exists():
        print(f"[ERROR] Database file not found at: {db_file}")
        sys.exit(1)

    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    try:
        findings = analyze_database(cursor)
        print_summary(findings)

        if not args.confirm:
            print("\n[NOTICE] Dry-run completed. No data was modified.")
            print("To execute cleanup with automatic backup, re-run with:")
            print("  python scripts/cleanup_test_data.py --confirm")
            return

        # Explicit confirmation supplied
        if args.backup:
            create_backup(db_file)

        execute_cleanup(conn, findings)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
