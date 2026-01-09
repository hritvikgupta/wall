"""RAIL example."""

from wall_library import WallGuard


def main():
    """RAIL example."""
    # RAIL specification
    rail_string = """
    <rail version="0.1">
    <output>
        <string name="name" validators="length" on-fail-length="exception"/>
    </output>
    </rail>
    """
    
    # Create guard from RAIL
    guard = WallGuard.for_rail_string(rail_string)
    print("Guard created from RAIL specification")


if __name__ == "__main__":
    main()


