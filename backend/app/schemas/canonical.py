from typing import List, Optional
from pydantic import BaseModel, Field

class SourceFact(BaseModel):
    text: str
    source_ref: Optional[str] = None

class Entity(BaseModel):
    name: str
    type: str

class SourceSection(BaseModel):
    id: str
    heading: str
    text: str

class CanonicalContent(BaseModel):
    title: str = Field(description="Clear title summarizing the source topic")
    summary: str = Field(description="Concise summary of the source content")
    key_points: List[str] = Field(default_factory=list, description="Core key points extracted from the source")
    facts: List[SourceFact] = Field(default_factory=list, description="Key verifiable facts from the source")
    statistics: List[SourceFact] = Field(default_factory=list, description="Numerical data, metrics, or percentages")
    dates: List[SourceFact] = Field(default_factory=list, description="Dates, deadlines, or timelines")
    entities: List[Entity] = Field(default_factory=list, description="Named entities such as companies, CVEs, people, or products")
    risks: List[str] = Field(default_factory=list, description="Risks, impacts, or vulnerabilities mentioned")
    recommendations: List[str] = Field(default_factory=list, description="Actionable recommendations or next steps")
    source_sections: List[SourceSection] = Field(default_factory=list, description="Breakdown of source sections with unique IDs for reference")
