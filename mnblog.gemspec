# frozen_string_literal: true

Gem::Specification.new do |spec|
  spec.name          = "mnblog"
  spec.version       = "0.3.0"
  spec.authors       = ["miniLV"]
  spec.email         = [""]

  spec.summary       = "Warm editorial Jekyll theme with an agent-friendly CLI"
  spec.homepage      = "https://github.com/miniLV/mnblog"
  spec.license       = "Apache-2.0"

  spec.files = Dir.chdir(__dir__) do
    `git ls-files -z`.split("\x0").select do |f|
      f.match(%r{^(assets|_layouts|_includes|_sass|css|js|LICENSE|README)}i)
    end
  end

  spec.add_runtime_dependency "jekyll", ">= 3.9", "< 5.0"
end
