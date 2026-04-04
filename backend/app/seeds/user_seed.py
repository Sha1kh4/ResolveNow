async def seed_users() -> None:
    """
    Keep startup compatible with environments that do not preload sample users.
    Initial admin bootstrap is handled separately by AuthService.
    """
    return None
